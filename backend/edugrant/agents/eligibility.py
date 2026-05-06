from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..state.graph_state import EduGrantState
from ..state.schemas import EligibilityResult
from ..config import settings
from ..tools.audit import audit_event

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

    llm = ChatOpenAI(model="gpt-4o", temperature=0).with_structured_output(EligibilityResult)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Eligibility Scoring Agent. Evaluate the student's extracted data against the scholarship rubric. "
                   "Provide a score from 0-100 and a recommendation (auto_approve, auto_reject, human_review). "
                   "Include your reasoning chain."),
        ("user", "Extracted Data: {data}\nRubric: {rubric}")
    ])
    
    # Simple default rubric for MVP
    rubric = "GPA > 3.5: 50 points. Financial need documented: 30 points. Personal essay quality: 20 points."
    
    chain = prompt | llm
    
    result = await chain.ainvoke({
        "data": state.get("extracted_data"),
        "rubric": rubric
    })
    
    return {
        "eligibility_result": result
    }
