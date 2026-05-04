from pydantic import BaseModel, Field, EmailStr
from datetime import date
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
