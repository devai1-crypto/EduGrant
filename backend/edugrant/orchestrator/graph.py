from langgraph.graph import StateGraph, END
from ..state.graph_state import EduGrantState

# Placeholder agent nodes
async def triage_node(state: EduGrantState):
    print("---TRIAGE---")
    # For now, just proceed
    return {
        "scholarship_type": "merit_undergrad",
        "routing_decision": "proceed",
        "triage_reasoning": "Application looks complete for merit scholarship."
    }

async def doc_intel_node(state: EduGrantState):
    print("---DOC INTEL---")
    return {
        "extracted_data": None, # Will be populated by agent
        "missing_fields": []
    }

async def eligibility_node(state: EduGrantState):
    print("---ELIGIBILITY---")
    return {
        "eligibility_result": {
            "eligibility_score": 85,
            "recommendation": "auto_approve",
            "reasoning_chain": "Strong academic record and clear financial need.",
            "confidence": 0.95
        }
    }

async def outreach_node(state: EduGrantState):
    print("---OUTREACH---")
    return {
        "outreach_sent_at": "2024-05-04T12:00:00Z"
    }

async def decision_node(state: EduGrantState):
    print("---DECISION---")
    return {
        "final_decision": "approved"
    }

# Routing logic
def route_after_triage(state: EduGrantState) -> str:
    if state["routing_decision"] == "reject_invalid":
        return "decision"
    return "doc_intel"

def route_after_doc_intel(state: EduGrantState) -> str:
    if state.get("missing_fields"):
        return "outreach"
    return "eligibility"

def build_graph():
    workflow = StateGraph(EduGrantState)
    
    # Define the nodes
    workflow.add_node("triage", triage_node)
    workflow.add_node("doc_intel", doc_intel_node)
    workflow.add_node("eligibility", eligibility_node)
    workflow.add_node("outreach", outreach_node)
    workflow.add_node("decision", decision_node)
    
    # Define the edges
    workflow.set_entry_point("triage")
    
    workflow.add_conditional_edges(
        "triage",
        route_after_triage,
        {
            "doc_intel": "doc_intel",
            "decision": "decision"
        }
    )
    
    workflow.add_conditional_edges(
        "doc_intel",
        route_after_doc_intel,
        {
            "outreach": "outreach",
            "eligibility": "eligibility"
        }
    )
    
    workflow.add_edge("eligibility", "decision")
    workflow.add_edge("outreach", END)
    workflow.add_edge("decision", END)
    
    return workflow.compile()

# Global graph instance
graph = build_graph()
