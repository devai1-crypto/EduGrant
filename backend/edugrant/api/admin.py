import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from ..state.db import get_db, Application, Decision, AgentRun, AgentEvent, Attachment
from ..state.schemas import AdminApplicationSummary
from ..orchestrator.checkpointer import graph

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/queue", response_model=List[AdminApplicationSummary])
async def get_admin_queue(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).order_by(Application.created_at.desc()))
    apps = result.scalars().all()
    
    summaries = []
    for app in apps:
        # Get latest decision if any
        dec_result = await db.execute(
            select(Decision)
            .where(Decision.application_id == app.application_id)
            .order_by(Decision.decided_at.desc())
            .limit(1)
        )
        latest_dec = dec_result.scalar_one_or_none()
        
        summaries.append({
            "application_id": str(app.application_id),
            "student_name": app.raw_payload.get("fullName", "Unknown"),
            "gpa": float(app.raw_payload.get("gpa", 0.0)),
            "status": app.status,
            "eligibility_score": latest_dec.eligibility_score if latest_dec else None,
            "recommendation": latest_dec.final_decision if latest_dec else None
        })
    return summaries

@router.get("/applications/{id}")
async def get_application_detail(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Get all events for audit trail
    events_result = await db.execute(
        select(AgentEvent)
        .join(AgentRun)
        .where(AgentRun.application_id == id)
        .order_by(AgentEvent.created_at.asc())
    )
    events = events_result.scalars().all()
    
    # Get attachments
    att_result = await db.execute(select(Attachment).where(Attachment.application_id == id))
    attachments = att_result.scalars().all()
    
    # Get current state from LangGraph
    config = {"configurable": {"thread_id": str(id)}}
    state = await graph.aget_state(config)
    extracted_data = state.values.get("extracted_data") if state else None
    
    return {
        "application": db_app,
        "attachments": attachments,
        "extracted_data": extracted_data,
        "audit_trail": events,
        "current_state": state.values if state else None
    }

@router.post("/applications/{id}/override")
async def override_decision(id: uuid.UUID, payload: dict, db: AsyncSession = Depends(get_db)):
    decision = payload.get("decision")
    reason = payload.get("reason", "Manual override")
    
    await db.execute(
        update(Application)
        .where(Application.application_id == id)
        .values(status=decision)
    )
    
    # Log the override decision
    db_decision = Decision(
        application_id=id,
        final_decision=decision,
        reasoning_text=reason,
        decided_by="admin",
        eligibility_score=100 # Default for manual approval
    )
    db.add(db_decision)
    await db.commit()
    
    return {"status": "overridden", "new_status": decision}
