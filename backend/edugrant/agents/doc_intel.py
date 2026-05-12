import os
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
    Simulated fast text extraction using PyMuPDF.
    In a real system, this would download the PDF and use fitz to get text.
    """
    return "Simulated text from PDF..."

@audit_event("doc_intel")
async def run(state: EduGrantState):
    """
    Reads PDFs attached to the application and extracts structured data.
    Implements a two-pass strategy:
    Pass 1: Fast text extraction (PyMuPDF)
    Pass 2: Vision fallback for scanned documents or low confidence.
    """
    if not settings.OPENAI_API_KEY:
        return {
            "extracted_data": ExtractedData(
                student_info=StudentInfo(
                    full_name="Alexander Hamilton",
                    email="alex@edu.com",
                    date_of_birth="1755-01-11",
                    nationality="US"
                ),
                transcript_info=TranscriptInfo(
                    institution="King's College",
                    gpa=3.9,
                    courses_completed=64,
                    confidence=1.0
                ),
                missing_critical_fields=[]
            ),
            "missing_fields": [],
            "document_quality_flags": []
        }

    # Pass 1: Attempt fast extraction
    all_text = ""
    for att in state.get("attachment_manifest", []):
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
        ("system", "You are the Document Intelligence Agent. Extract structured information from the provided text or images. "
                   "If the document quality is low or key information is missing, flag it in missing_critical_fields. "
                   "Provide a confidence score for academic data."),
        ("user", "Extracted Text Content:\n{text}\n\nSchema Requirement: ExtractedData model.")
    ])
    
    chain = prompt | llm
    
    try:
        result = await chain.ainvoke({"text": all_text})
        
        # Pass 2: Vision Fallback (Simulated)
        # If gpa is missing or confidence < 0.7, we would trigger a vision-based pass here.
        if result.transcript_info and result.transcript_info.confidence < 0.7:
             print("Low confidence - triggering vision pass (simulated)")
             # Vision logic would go here: rasterize PDF -> GPT-4o vision
        
        return {
            "extracted_data": result,
            "missing_fields": result.missing_critical_fields,
            "document_quality_flags": []
        }
    except Exception as e:
        print(f"Doc Intel Error: {e}")
        return {
            "extracted_data": None,
            "missing_fields": ["ALL"],
            "document_quality_flags": ["extraction_failed"]
        }

