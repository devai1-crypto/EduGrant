from pydantic import BaseModel, Field, EmailStr
from datetime import date, datetime
from typing import Optional, List, Literal, Annotated
from decimal import Decimal

class StudentInfo(BaseModel):
    full_name: str
    email: EmailStr
    date_of_birth: date
    nationality: str
    student_id: Optional[str] = None

class TranscriptInfo(BaseModel):
    institution: str
    gpa: Decimal = Field(..., ge=0, le=4, description="On 4.0 scale")
    courses_completed: int
    confidence: float = Field(..., ge=0, le=1)

class IncomeProofInfo(BaseModel):
    annual_income: Decimal
    currency: str = "USD"
    employer: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1)

class ExtractedData(BaseModel):
    student_info: Optional[StudentInfo] = None
    transcript_info: Optional[TranscriptInfo] = None
    income_proof: Optional[IncomeProofInfo] = None
    missing_critical_fields: List[str] = []

class EligibilityResult(BaseModel):
    eligibility_score: int = Field(..., ge=0, le=100)
    recommendation: Literal["auto_approve", "auto_reject", "human_review"]
    reasoning_chain: str
    confidence: float

class OutreachDraft(BaseModel):
    subject: str
    body: str
    missing_fields: List[str]
    suggested_attachments: List[str]

class ApplicationPayload(BaseModel):
    scholarship_type: str
    form_data: dict
    attachments: List[str]  # List of S3 keys

class ApplicationResponse(BaseModel):
    application_id: str
    run_id: str

class ApplicationStatusResponse(BaseModel):
    status: str
    run_id: Optional[str] = None
    current_node: Optional[str] = None
    last_event_at: Optional[datetime] = None
    missing_fields: List[str] = []

class AgentEventResponse(BaseModel):
    node_name: str
    event_type: str
    input_summary: Optional[dict] = None
    output_summary: Optional[dict] = None
    latency_ms: Optional[int] = None
    created_at: datetime

class AdminApplicationSummary(BaseModel):
    application_id: str
    student_name: str
    gpa: float
    status: str
    latest_run_id: Optional[str] = None
    eligibility_score: Optional[int] = None
    recommendation: Optional[str] = None
