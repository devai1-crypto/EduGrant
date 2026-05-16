import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from ..state.db import get_db, Application, Decision, AgentRun, AgentEvent, Attachment, Institution
from ..state.schemas import AdminApplicationSummary
from ..orchestrator.checkpointer import graph
from .deps import verify_admin_token
from ..tools.s3 import get_presigned_url, get_s3_client
from ..config import settings
from sqlalchemy import delete

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(verify_admin_token)])

def format_status(s: str) -> str:
    if not s: return ""
    return s.replace("_", " ").upper()


@router.get("/queue", response_model=List[AdminApplicationSummary])
async def get_admin_queue(db: AsyncSession = Depends(get_db), institute_id: str = Depends(verify_admin_token)):
    result = await db.execute(
        select(Application)
        .where(Application.target_institution == institute_id)
        .order_by(Application.created_at.desc())
    )
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
            try:
                config = {"configurable": {"thread_id": str(app.application_id)}}
                state = await graph.aget_state(config)
            except Exception as e:
                print(f"Error fetching state for {app.application_id}: {e}")
            
        # Safely extract data with multiple fallbacks
        state_values = state.values if state and state.values else {}
        extracted_data = state_values.get("extracted_data") or {}
        if not isinstance(extracted_data, dict): extracted_data = {}
        
        student_info = extracted_data.get("student_info") or {}
        if not isinstance(student_info, dict): student_info = {}
        
        transcript_info = extracted_data.get("transcript_info") or {}
        if not isinstance(transcript_info, dict): transcript_info = {}

        student_name = student_info.get("full_name") or app.raw_payload.get("fullName") or app.raw_payload.get("full_name") or "Unknown"
        gpa = transcript_info.get("gpa") or app.raw_payload.get("gpa") or 0.0
        try:
            gpa = float(gpa)
        except:
            gpa = 0.0
        
        summaries.append({
            "application_id": str(app.application_id),
            "student_name": student_name,
            "gpa": gpa,
            "status": format_status(app.status),
            "latest_run_id": str(latest_run.run_id) if latest_run else None,
            "eligibility_score": latest_dec.eligibility_score if latest_dec else None,
            "recommendation": format_status(latest_dec.final_decision) if latest_dec else None
        })
    return summaries


@router.get("/applications/{id}")
async def get_application_detail(id: uuid.UUID, db: AsyncSession = Depends(get_db), institute_id: str = Depends(verify_admin_token)):
    # Force UUID type check
    if not isinstance(id, uuid.UUID):
        try:
            id = uuid.UUID(str(id))
        except:
            raise HTTPException(status_code=400, detail="Invalid UUID format")

    result = await db.execute(
        select(Application)
        .where(Application.application_id == id)
        .where(Application.target_institution == institute_id)
    )
    db_app = result.scalar_one_or_none()
    
    if not db_app:
        raise HTTPException(status_code=403, detail="Application not found or access denied for this institution")
        
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
    
    # Fallback: Get latest decision if state is missing eligibility data
    # (Happens during re-analysis when state is reset)
    latest_decision = None
    if not eligibility_result or not extracted_data:
        dec_result = await db.execute(
            select(Decision)
            .where(Decision.application_id == id)
            .order_by(Decision.decided_at.desc())
            .limit(1)
        )
        latest_decision = dec_result.scalar_one_or_none()
        
        if latest_decision and not eligibility_result:
            # Reconstruct a basic result object for the UI
            eligibility_result = {
                "eligibility_score": latest_decision.eligibility_score,
                "reasoning_chain": latest_decision.reasoning_text,
                "recommendation": latest_decision.final_decision
            }

@router.post("/settings/rubric")
async def update_rubric(rubric: dict, db: AsyncSession = Depends(get_db), institute_id: str = Depends(verify_admin_token)):
    result = await db.execute(select(Institution).where(Institution.id == institute_id))
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    inst.rubric = rubric
    await db.commit()
    return {"status": "success", "rubric": rubric}

@router.get("/settings/rubric")
async def get_rubric(db: AsyncSession = Depends(get_db), institute_id: str = Depends(verify_admin_token)):
    result = await db.execute(select(Institution).where(Institution.id == institute_id))
    inst = result.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    return inst.rubric

@router.post("/applications/{id}/override")
async def override_decision(id: uuid.UUID, payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    try:
        decision = payload.get("decision")
        reason = payload.get("reason", "Manual override")
        
        print(f"DEBUG: Overriding {id} to {decision} with reason: {reason}")

        # Fetch application to get student email
        res = await db.execute(select(Application).where(Application.application_id == id))
        db_app = res.scalar_one_or_none()
        if not db_app:
            raise HTTPException(status_code=404, detail="Application not found")

        await db.execute(
            update(Application)
            .where(Application.application_id == id)
            .values(status=decision)
        )
        
        # Log the override decision
        # Try to keep the existing AI score if available
        existing_score = 0
        if db_app:
            # Look for latest agent decision to get the AI score
            agent_dec = await db.execute(
                select(Decision.eligibility_score)
                .where(Decision.application_id == id)
                .where(Decision.decided_by == 'agent')
                .order_by(Decision.decided_at.desc())
                .limit(1)
            )
            existing_score = agent_dec.scalar_one_or_none() or 0

        db_decision = Decision(
            application_id=id,
            final_decision=decision,
            reasoning_text=reason,
            decided_by="admin",
            eligibility_score=existing_score
        )
        db.add(db_decision)
        await db.commit()
        
        # Send email in background
        if decision in ["approved", "rejected"]:
            from ..tools.email import send_decision_email
            background_tasks.add_task(
                send_decision_email,
                email=db_app.student_email,
                application_id=id,
                decision=decision,
                score=existing_score,
                reasoning=reason
            )

        return {"status": "overridden", "new_status": decision}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/applications/{id}/decision")
async def record_manual_decision(
    id: uuid.UUID,
    decision: dict, # { "final_decision": "approved", "reasoning_text": "..." }
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Verify application exists
    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Get latest run_id if exists
    run_result = await db.execute(
        select(AgentRun.run_id)
        .where(AgentRun.application_id == id)
        .order_by(AgentRun.started_at.desc())
        .limit(1)
    )
    run_id = run_result.scalar_one_or_none()
    
    # Try to keep the existing AI score if available
    existing_score = 0
    agent_dec = await db.execute(
        select(Decision.eligibility_score)
        .where(Decision.application_id == id)
        .where(Decision.decided_by == 'agent')
        .order_by(Decision.decided_at.desc())
        .limit(1)
    )
    existing_score = agent_dec.scalar_one_or_none() or 0

    # Create manual decision record
    new_decision = Decision(
        application_id=id,
        run_id=run_id,
        final_decision=decision.get("final_decision"),
        reasoning_text=decision.get("reasoning_text"),
        eligibility_score=existing_score,
        decided_by="admin_manual",
        decided_at=datetime.utcnow()
    )
    
    # Update application status
    final_dec = decision.get("final_decision")
    db_app.status = final_dec
    
    db.add(new_decision)
    await db.commit()
    
    # Send email in background
    if final_dec in ["approved", "rejected"]:
        from ..tools.email import send_decision_email
        background_tasks.add_task(
            send_decision_email,
            email=db_app.student_email,
            application_id=id,
            decision=final_dec,
            score=new_decision.eligibility_score,
            reasoning=new_decision.reasoning_text
        )

    return {"status": "success", "message": "Decision recorded"}
@router.post("/applications/{id}/reanalyze")
async def reanalyze_application(id: uuid.UUID, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # Verify application exists
    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Reset application status
    db_app.status = "processing"
    
    # Create a new AgentRun
    run_id = uuid.uuid4()
    db_run = AgentRun(
        run_id=run_id,
        application_id=id,
        graph_version="v1.1-fixed-intel",
        status="active"
    )
    db.add(db_run)
    await db.commit()
    
    # Trigger orchestrator - we'll clear state by passing initial_state to a fresh thread_id or updating current
    from .applications import run_orchestrator
    background_tasks.add_task(run_orchestrator, str(id), str(run_id), resume=False)
    
    return {"status": "reanalysis_started", "run_id": str(run_id)}

@router.delete("/applications/{id}")
async def delete_application(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Verify application exists
    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get all attachments to delete from S3
    att_result = await db.execute(select(Attachment).where(Attachment.application_id == id))
    attachments = att_result.scalars().all()
    
    s3 = get_s3_client()
    for att in attachments:
        try:
            s3.delete_object(Bucket=settings.R2_BUCKET, Key=att.s3_key)
        except Exception as e:
            print(f"Error deleting S3 object {att.s3_key}: {e}")

    # Delete application (cascades will handle DB records)
    await db.delete(db_app)
    await db.commit()
    
    return {"status": "deleted", "id": str(id)}
