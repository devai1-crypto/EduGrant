from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..state.graph_state import EduGrantState
from ..state.schemas import ExtractedData, StudentInfo, TranscriptInfo, IncomeProofInfo
from ..config import settings
from ..tools.s3 import get_presigned_url
from ..tools.audit import audit_event

@audit_event("doc_intel")
async def run(state: EduGrantState):
    """
    Reads PDFs attached to the application and extracts structured data.
    """
    if not settings.OPENAI_API_KEY:
        return {
            "extracted_data": ExtractedData(
                student_info=StudentInfo(
                    full_name="Mock Student",
                    email="student@example.com",
                    date_of_birth="2000-01-01",
                    nationality="US"
                ),
                transcript_info=TranscriptInfo(
                    institution="Mock University",
                    gpa=3.8,
                    courses_completed=30,
                    confidence=1.0
                )
            ),
            "missing_fields": [],
            "document_quality_flags": []
        }

    llm = ChatOpenAI(model="gpt-4o", temperature=0).with_structured_output(ExtractedData)
    
    # In a real implementation, we would download the PDFs and extract text/images.
    # For now, we pass the pre-signed URLs to the prompt (GPT-4o vision can handle URLs in some contexts, 
    # but usually requires base64. Here we simulate the extraction logic).
    
    attachment_urls = [get_presigned_url(att["s3_key"]) for att in state.get("attachment_manifest", [])]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Document Intelligence Agent. Extract the following Pydantic model from the provided documents. "
                   "If a field is missing, add it to missing_critical_fields."),
        ("user", "Document URLs: {urls}")
    ])
    
    chain = prompt | llm
    
    # Note: Real vision extraction would involve more complex processing of the PDF pages.
    # This is the structured skeleton.
    try:
        result = await chain.ainvoke({"urls": attachment_urls})
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
