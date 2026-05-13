from typing import TypedDict, Optional, List, Literal, Annotated
from .schemas import ExtractedData, EligibilityResult, OutreachDraft

def add_messages(left: list, right: list):
    return left + right

class EduGrantState(TypedDict):
    # Identity
    application_id: str
    run_id: str
    raw_payload: dict
    attachment_manifest: List[dict]

    
    # Triage outputs
    scholarship_type: Literal["merit_undergrad"]
    completeness_score: float
    routing_decision: Literal["proceed", "request_missing_info", "reject_invalid"]
    triage_reasoning: str
    
    # Document Intelligence outputs
    extracted_data: Optional[ExtractedData]
    missing_fields: List[str]
    document_quality_flags: List[str]
    attachment_qualities: List[dict]

    
    # Outreach outputs
    outreach_draft: Optional[OutreachDraft]
    outreach_sent_at: Optional[str]
    
    # Eligibility outputs
    eligibility_result: Optional[EligibilityResult]
    
    # Final
    final_decision: Optional[Literal["approved", "rejected", "review"]]
    audit_trail: Annotated[List[dict], add_messages]
