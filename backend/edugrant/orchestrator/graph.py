from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from ..state.graph_state import EduGrantState
from ..agents import triage, doc_intel, eligibility, outreach
from ..state.db import Application, AgentRun, Decision, async_session

async def decision_node(state: EduGrantState):
    """
    Final deterministic node to persist the result.
    """
    print("---DECISION---")
    final_dec = "review"
    if state.get("eligibility_result"):
        rec = state["eligibility_result"].recommendation
        if rec == "auto_approve":
            final_dec = "approved"
        elif rec == "auto_reject":
            final_dec = "rejected"
            
    # Persist to DB
    async with async_session() as db:
        # Update Application status
        await db.execute(
            update(Application)
            .where(Application.application_id == state["application_id"])
            .values(status=final_dec)
        )
        
        # Create Decision record
        db_decision = Decision(
            application_id=state["application_id"],
            run_id=state["run_id"],
            final_decision=final_dec,
            eligibility_score=state["eligibility_result"].eligibility_score if state.get("eligibility_result") else 0,
            reasoning_text=state["eligibility_result"].reasoning_chain if state.get("eligibility_result") else "No eligibility result.",
            decided_by="agent"
        )
        db.add(db_decision)
        
        # Update AgentRun status
        await db.execute(
            update(AgentRun)
            .where(AgentRun.run_id == state["run_id"])
            .values(status="completed", final_decision=final_dec)
        )
        
        await db.commit()

    return {
        "final_decision": final_dec
    }

# Routing logic
def route_after_triage(state: EduGrantState) -> str:
    if state.get("routing_decision") == "reject_invalid":
        return "decision"
    return "doc_intel"

def route_after_doc_intel(state: EduGrantState) -> str:
    if state.get("missing_fields"):
        return "outreach"
    return "eligibility"

def build_graph(checkpointer=None):
    workflow = StateGraph(EduGrantState)
    
    # Define the nodes
    workflow.add_node("triage", triage.run)
    workflow.add_node("doc_intel", doc_intel.run)
    workflow.add_node("eligibility", eligibility.run)
    workflow.add_node("outreach", outreach.run)
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
    workflow.add_edge("outreach", END) # interrupt_after handles the pause
    workflow.add_edge("decision", END)
    
    return workflow.compile(
        checkpointer=checkpointer,
        interrupt_after=["outreach"]
    )

# Note: The global graph instance will be built by the API layer with a real checkpointer
# For now, we provide a default one for compatibility
graph = build_graph()
