from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres import PostgresSaver
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, select

from ..state.graph_state import EduGrantState
from ..agents import triage, doc_intel, eligibility, outreach
from ..state.db import Application, AgentRun, Decision, async_session

async def decision_node(state: EduGrantState):
    """
    Final deterministic node to persist the result.
    """
    print("---DECISION---")
    final_dec = "review"
    elig_res = state.get("eligibility_result")
    if elig_res:
        # Handle both dict (from DB checkpoint) and object (from MemorySaver)
        if isinstance(elig_res, dict):
            rec = elig_res.get("recommendation")
            score = elig_res.get("eligibility_score", 0)
            reasoning = elig_res.get("reasoning_chain", "No reasoning.")
        else:
            rec = getattr(elig_res, "recommendation", None)
            score = getattr(elig_res, "eligibility_score", 0)
            reasoning = getattr(elig_res, "reasoning_chain", "No reasoning.")

        if rec == "auto_approve":
            final_dec = "approved"
        elif rec == "auto_reject":
            final_dec = "rejected"
    else:
        score = 0
        reasoning = "No eligibility result."
            
    # Persist to DB
    async with async_session() as db:
        # Fetch student email
        app_result = await db.execute(
            select(Application.student_email).where(Application.application_id == state["application_id"])
        )
        student_email = app_result.scalar_one_or_none()

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
            eligibility_score=score,
            reasoning_text=reasoning,
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

        # Send decision email if finalized
        if final_dec in ["approved", "rejected"] and student_email:
            from ..tools.email import send_decision_email
            # Run in background or just await since we are in a node
            await send_decision_email(
                email=student_email,
                application_id=state["application_id"],
                decision=final_dec,
                score=score,
                reasoning=reasoning
            )

    return {
        "final_decision": final_dec
    }
    
async def failed_run_node(state: EduGrantState):
    """
    Node to handle and log failures.
    """
    print("---FAILED RUN---")
    async with async_session() as db:
        await db.execute(
            update(AgentRun)
            .where(AgentRun.run_id == state["run_id"])
            .values(status="failed")
        )
        await db.commit()
    return {"status": "failed"}

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
    workflow.add_node("failed_run", failed_run_node)
    
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
    workflow.add_edge("outreach", "doc_intel") # resume goes back to doc intel
    workflow.add_edge("decision", END)
    workflow.add_edge("failed_run", END)
    
    return workflow.compile(
        checkpointer=checkpointer,
        interrupt_after=["outreach"]
    )

# Note: The global graph instance will be built by the checkpointer module
# or the API layer with a real checkpointer.
