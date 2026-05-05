from typing import TypedDict, Literal
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from ..state.graph_state import EduGrantState
from ..config import settings

class TriageOutput(BaseModel):
    scholarship_type: Literal["merit_undergrad"] = Field(description="The type of scholarship applied for")
    completeness_score: float = Field(description="Score from 0.0 to 1.0 based on how complete the application is")
    routing_decision: Literal["proceed", "request_missing_info", "reject_invalid"] = Field(description="Next step in the workflow")
    triage_reasoning: str = Field(description="Explanation for the triage decision")

async def run(state: EduGrantState):
    """
    Classifies inbound applications and routes to the right downstream path.
    """
    if not settings.OPENAI_API_KEY:
        # Fallback for "skip the paid things" / mock mode
        return {
            "scholarship_type": "merit_undergrad",
            "completeness_score": 1.0,
            "routing_decision": "proceed",
            "triage_reasoning": "Mock triage: No API key provided, proceeding as default."
        }

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0).with_structured_output(TriageOutput)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Triage Agent for EduGrant AI. Your job is to classify inbound scholarship applications. "
                   "Classify by scholarship type, completeness, and priority. "
                   "For MVP, only 'merit_undergrad' is supported. "
                   "Check if all required fields are present in the payload and if attachments exist."),
        ("user", "Application Payload: {payload}\nAttachments: {attachments}")
    ])
    
    chain = prompt | llm
    
    result = await chain.ainvoke({
        "payload": state.get("raw_payload", {}),
        "attachments": state.get("attachment_manifest", [])
    })
    
    return {
        "scholarship_type": result.scholarship_type,
        "completeness_score": result.completeness_score,
        "routing_decision": result.routing_decision,
        "triage_reasoning": result.triage_reasoning
    }
