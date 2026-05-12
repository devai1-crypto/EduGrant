import os
import fitz  # PyMuPDF
import urllib.request
import tempfile
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..state.graph_state import EduGrantState
from ..state.schemas import ExtractedData, StudentInfo, TranscriptInfo, IncomeProofInfo
from ..config import settings
from ..tools.s3 import get_presigned_url
from ..tools.audit import audit_event

async def extract_text_pymupdf(url: str) -> str:
    """
    Downloads the PDF from the presigned URL and extracts text using PyMuPDF.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            urllib.request.urlretrieve(url, tmp.name)
            doc = fitz.open(tmp.name)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            os.unlink(tmp.name)
            return text
    except Exception as e:
        print(f"Extraction Error: {e}")
        return ""

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
        url = get_presigned_url(att["s3_key"])
        text = await extract_text_pymupdf(url)
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
                   "List any missing critical fields in missing_critical_fields."),
        ("user", "Extracted Text Content:\n{text}\n\nSchema Requirement: ExtractedData model.")
    ])
    
    chain = prompt | llm
    
    try:
        result = await chain.ainvoke({"text": all_text})
        
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
                result.transcript_info.gpa = float(raw.get("gpa", 0))
            except: pass

        # Clean up missing_fields: if we found it in raw_payload, it's no longer "critically missing"
        updated_missing = []
        if not result.student_info.full_name: updated_missing.append("full_name")
        if not result.transcript_info.gpa: updated_missing.append("gpa")
        
        return {
            "extracted_data": result,
            "missing_fields": updated_missing,
            "document_quality_flags": []
        }
    except Exception as e:
        print(f"Doc Intel Error: {e}")
        return {
            "extracted_data": None,
            "missing_fields": ["extraction_failed"],
            "document_quality_flags": ["error"]
        }

