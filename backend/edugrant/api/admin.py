import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from ..state.db import get_db, Application, Decision, AgentRun, AgentEvent, Attachment
from ..state.schemas import AdminApplicationSummary
from ..orchestrator.checkpointer import graph
from .deps import verify_admin_token
from ..tools.s3 import get_presigned_url

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(verify_admin_token)])

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
        
        # Get latest run
        run_result = await db.execute(
            select(AgentRun)
            .where(AgentRun.application_id == app.application_id)
            .order_by(AgentRun.started_at.desc())
            .limit(1)
        )
        latest_run = run_result.scalar_one_or_none()
        
        # Get state from LangGraph
        state = None
        if latest_run:
            config = {"configurable": {"thread_id": str(app.application_id)}}
            state = await graph.aget_state(config)
            
        extracted_data = state.values.get("extracted_data") if state and state.values else {}
        
        summaries.append({
            "application_id": str(app.application_id),
            "student_name": extracted_data.get("student_info", {}).get("full_name") or app.raw_payload.get("fullName") or "Unknown",
            "gpa": float(extracted_data.get("transcript_info", {}).get("gpa") or app.raw_payload.get("gpa") or 0.0),
            "status": app.status,
            "latest_run_id": str(latest_run.run_id) if latest_run else None,
            "eligibility_score": latest_dec.eligibility_score if latest_dec else None,
            "recommendation": latest_dec.final_decision if latest_dec else None
        })
    return summaries

@router.get("/applications/{id}")
async def get_application_detail(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Force UUID type check
    if not isinstance(id, uuid.UUID):
        try:
            id = uuid.UUID(str(id))
        except:
            raise HTTPException(status_code=400, detail="Invalid UUID format")

    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    
    if not db_app:
        # Debugging: check if any app exists
        all_apps = await db.execute(select(Application.application_id))
        print(f"DEBUG: Looking for {id}. Available IDs: {[str(a) for a in all_apps.scalars().all()]}")
        raise HTTPException(status_code=404, detail=f"Application {id} not found in database")
        
    # Get all events for audit trail
    events_result = await db.execute(
        select(AgentEvent)
        .join(AgentRun)
        .where(AgentRun.application_id == id)
        .order_by(AgentEvent.created_at.asc())
    )
    events = events_result.scalars().all()
    
    # Get attachments with presigned URLs
    att_result = await db.execute(select(Attachment).where(Attachment.application_id == id))
    db_attachments = att_result.scalars().all()
    attachments = []
    for att in db_attachments:
        attachments.append({
            "id": str(att.attachment_id),
            "filename": att.original_filename,
            "s3_key": att.s3_key,
            "presigned_url": get_presigned_url(att.s3_key)
        })
    
    # Get current state from LangGraph
    config = {"configurable": {"thread_id": str(id)}}
    state = await graph.aget_state(config)
    extracted_data = state.values.get("extracted_data") if state else None
    eligibility_result = state.values.get("eligibility_result") if state else None
    
    return {
        "application": db_app,
        "attachments": attachments,
        "extracted_data": extracted_data,
        "eligibility_result": eligibility_result,
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
