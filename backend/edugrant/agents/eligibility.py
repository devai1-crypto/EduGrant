import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..state.graph_state import EduGrantState
from ..state.schemas import EligibilityResult
from ..config import settings
from ..tools.audit import audit_event

def load_rubric(scholarship_type: str):
    """
    Loads the rubric for a given scholarship type from JSON.
    """
    base_path = os.path.dirname(__file__)
    rubric_path = os.path.join(base_path, "..", "rubrics", f"{scholarship_type}.json")
    if os.path.exists(rubric_path):
        with open(rubric_path, "r") as f:
            return json.load(f)
    return None

@audit_event("eligibility")
async def run(state: EduGrantState):
    """
    Applies the scholarship rubric to extracted data and produces a score.
    """
    if not settings.OPENAI_API_KEY:
        return {
            "eligibility_result": EligibilityResult(
                eligibility_score=85,
                recommendation="auto_approve",
                reasoning_chain="Mock eligibility: Good GPA and complete data.",
                confidence=0.9
            )
        }

    llm = ChatOpenAI(
        model="gpt-4o", 
        temperature=0,
        api_key=settings.OPENAI_API_KEY
    ).with_structured_output(EligibilityResult)
    
    # Load rubric based on scholarship type
    scholarship_type = state.get("scholarship_type", "merit_undergrad")
    rubric = load_rubric(scholarship_type)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Eligibility Scoring Agent for EduGrant AI. Evaluate the student's extracted data against the provided institutional rubric. "
                   "Provide a score from 0-100 and a recommendation (auto_approve, auto_reject, human_review). "
                   "Include your reasoning chain clearly mapping criteria to scores. Use bullet points and clear section headers (e.g., '### Academic Excellence') for readability."),

        ("user", "Extracted Data: {data}\n\nInstitutional Rubric:\n{rubric}")
    ])
    
    chain = prompt | llm
    
    extracted_data = state.get("extracted_data")
    data_to_send = {}
    if extracted_data:
        if hasattr(extracted_data, "model_dump"):
            data_to_send = extracted_data.model_dump()
        elif hasattr(extracted_data, "dict"):
            data_to_send = extracted_data.dict()
        else:
            data_to_send = extracted_data

    result = await chain.ainvoke({
        "data": json.dumps(data_to_send, indent=2, default=str),
        "rubric": json.dumps(rubric, indent=2) if rubric else "No rubric found."
    })
    
    return {

        "eligibility_result": result
    }

