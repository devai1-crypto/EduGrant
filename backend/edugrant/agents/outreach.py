import uuid
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..state.graph_state import EduGrantState
from ..state.schemas import OutreachDraft
from ..config import settings

async def run(state: EduGrantState):
    """
    Drafts an outreach email when documents are missing.
    """
    if not settings.OPENAI_API_KEY:
        return {
            "outreach_draft": OutreachDraft(
                subject="Missing Information for your Scholarship Application",
                body="Dear student, we are missing some documents...",
                missing_fields=state.get("missing_fields", []),
                suggested_attachments=["Transcript"]
            ),
            "outreach_sent_at": "2024-05-04T12:00:00Z" # Mock sent timestamp
        }

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0).with_structured_output(OutreachDraft)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Outreach Agent. Draft a polite and professional email to the student asking for missing documents. "
                   "List the missing fields clearly."),
        ("user", "Missing Fields: {fields}\nStudent Name: {name}")
    ])
    
    student_name = "Student"
    if state.get("extracted_data") and state["extracted_data"].student_info:
        student_name = state["extracted_data"].student_info.full_name
        
    chain = prompt | llm
    
    result = await chain.ainvoke({
        "fields": state.get("missing_fields", []),
        "name": student_name
    })
    
    # In a real system, we would trigger SendGrid here if SENDGRID_API_KEY is set.
    
    return {
        "outreach_draft": result,
        "outreach_sent_at": "now" # Placeholder
    }
