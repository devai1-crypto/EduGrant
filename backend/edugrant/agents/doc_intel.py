import os
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None
import urllib.request
import docx
from ..tools.s3 import download_file

import tempfile
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..state.graph_state import EduGrantState
from decimal import Decimal
from ..state.schemas import ExtractedData, StudentInfo, TranscriptInfo, IncomeProofInfo

from ..config import settings
from ..tools.s3 import get_presigned_url
from ..tools.audit import audit_event

async def extract_text_from_file(s3_key: str, filename: str) -> str:
    """
    Downloads and extracts text based on file extension.
    """
    suffix = ".pdf" if filename.lower().endswith(".pdf") else ".docx" if filename.lower().endswith(".docx") else ".txt"
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        try:
            print(f"Downloading {s3_key} to {tmp.name}")
            download_file(s3_key, tmp.name)
            
            if suffix == ".pdf":
                if fitz is None: return ""
                doc = fitz.open(tmp.name)
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                return text
            elif suffix == ".docx":
                doc = docx.Document(tmp.name)
                return "\n".join([p.text for p in doc.paragraphs])
            else:
                with open(tmp.name, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
        except Exception as e:
            print(f"Error extracting text from {filename}: {e}")
            return ""
        finally:
            if os.path.exists(tmp.name):
                os.remove(tmp.name)


@audit_event("doc_intel")
async def run(state: EduGrantState):
    """
    Reads PDFs attached to the application and extracts structured data.
    """
    if not settings.OPENAI_API_KEY:
        # Fallback to demo data if no API key
        return {
            "extracted_data": ExtractedData(
                student_info=StudentInfo(full_name="Alexander Hamilton", email="alex@edu.com", date_of_birth="1755-01-11", nationality="US"),
                transcript_info=TranscriptInfo(institution="King's College", gpa=3.9, courses_completed=64, confidence=1.0),
                missing_critical_fields=[]
            ),
            "missing_fields": [],
            "document_quality_flags": []
        }

    # Pass 1: Attempt real extraction from all attachments
    all_text = ""
    attachments = state.get("attachment_manifest", [])
    for att in attachments:
        text = await extract_text_from_file(att["s3_key"], att["filename"])
        all_text += f"\n--- Document: {att['filename']} ---\n{text}\n"


    # Extraction with structured output
    llm = ChatOpenAI(
        model="gpt-4o", 
        temperature=0,
        api_key=settings.OPENAI_API_KEY
    ).with_structured_output(ExtractedData)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Document Intelligence Agent. Extract structured information from the provided text. "
                   "If you cannot find specific fields in the text, leave them blank but DO NOT invent data. "
                   "List any missing critical fields in missing_critical_fields. "
                   "IMPORTANT: Evaluate each document in 'attachment_qualities'. For each file, determine if it is "
                   "actually what it claims to be (e.g. is 'transcript.pdf' a real transcript?). "
                   "Provide a boolean 'is_valid' and a brief 'reason' for each file."),
        ("user", "Extracted Text Content:\n{text}\n\nSchema Requirement: ExtractedData model.")

    ])
    
    chain = prompt | llm
    
    try:
        result = await chain.ainvoke({"text": all_text})
        
        # Ensure objects exist even if LLM skipped them
        if not result.student_info: result.student_info = StudentInfo()
        if not result.transcript_info: result.transcript_info = TranscriptInfo()
        if not result.income_proof: result.income_proof = IncomeProofInfo()
        if not hasattr(result, 'document_quality_flags') or not result.document_quality_flags: 
            result.document_quality_flags = []
        
        # --- SAFETY NET / FALLBACK ---
        # If the LLM failed to find data in the PDFs, we look at the raw_payload (what the student typed)
        # to ensure we have enough to proceed to Scoring.
        raw = state.get("raw_payload", {})
        
        if not result.student_info.full_name:
            result.student_info.full_name = raw.get("full_name") or raw.get("fullName")
            
        if not result.transcript_info.institution:
            result.transcript_info.institution = raw.get("institution")
            
        if not result.transcript_info.gpa:
            try:
                gpa_val = raw.get("gpa")
                if gpa_val: result.transcript_info.gpa = Decimal(str(gpa_val))
            except: pass

        if not result.income_proof.annual_income:
            try:
                income_val = raw.get("annual_income") or raw.get("annualIncome") or raw.get("income")
                if income_val: result.income_proof.annual_income = Decimal(str(income_val))
            except: pass


        # Clean up missing_fields: For scoring to happen, we only REALLY need a GPA.
        # If we have a GPA (either from PDF or Form), we proceed.
        updated_missing = []
        if not hasattr(result, 'document_quality_flags') or not result.document_quality_flags: 
            result.document_quality_flags = []
        if not hasattr(result, 'attachment_qualities') or not result.attachment_qualities:
            result.attachment_qualities = []
        
        if not result.transcript_info.gpa:
            updated_missing.append("gpa")
        
        return {
            "extracted_data": result,
            "missing_fields": updated_missing,
            "document_quality_flags": result.document_quality_flags,
            "attachment_qualities": result.attachment_qualities
        }
    except Exception as e:
        print(f"Doc Intel Error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "extracted_data": ExtractedData(student_info=StudentInfo(), transcript_info=TranscriptInfo()),
            "missing_fields": ["extraction_failed"],
            "document_quality_flags": ["error"]
        }

