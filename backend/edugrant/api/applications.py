import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..state.db import get_db, Application, Attachment, AgentRun, AgentEvent, async_session
from ..state.schemas import ApplicationPayload, ApplicationResponse, ApplicationStatusResponse
from ..orchestrator.checkpointer import graph
from ..tools.email import send_outreach_email, send_application_confirmation


router = APIRouter(prefix="/api/applications", tags=["applications"])

async def run_orchestrator(application_id: str, run_id: str, resume: bool = False):
    """
    Background task to run or resume the LangGraph.
    """
    print(f"{'Resuming' if resume else 'Starting'} orchestrator for app {application_id}")
    try:
        config = {"configurable": {"thread_id": application_id}}
        if resume:
            # Resuming from a breakpoint (after outreach)
            await graph.ainvoke(None, config=config)
        else:
            # New run: Fetch application details to populate initial state
            async with async_session() as db:
                result = await db.execute(
                    select(Application).where(Application.application_id == uuid.UUID(application_id))
                )
                db_app = result.scalar_one_or_none()
                
                att_result = await db.execute(
                    select(Attachment).where(Attachment.application_id == uuid.UUID(application_id))
                )
                db_attachments = att_result.scalars().all()
                
                manifest = [{"s3_key": att.s3_key, "filename": att.original_filename} for att in db_attachments]
                
                initial_state = {
                    "application_id": application_id,
                    "run_id": run_id,
                    "raw_payload": db_app.raw_payload if db_app else {},
                    "attachment_manifest": manifest,
                    "audit_trail": [{"event": "start", "timestamp": "now"}],
                    "eligibility_result": None,
                    "extracted_data": None,
                    "missing_fields": []
                }

                await graph.ainvoke(initial_state, config=config)
    except Exception as e:
        print(f"Orchestrator Error: {e}")

async def send_confirmation_email(email: str, application_id: str):
    """
    Sends a confirmation email to the student with their ID.
    """
    subject = "Application Received - EduGrant AI"
    body = f"""
    <h2>We've Received Your Application</h2>
    <p>Thank you for applying for a scholarship via EduGrant AI. Your application has been successfully submitted and is currently being processed by our intelligent agents.</p>
    <p><b>Your Application Reference ID:</b> {application_id}</p>
    <p>You can track the live progress of your application at any time using the link below:</p>
    <p><a href='http://localhost:5173/status/latest?appId={application_id}'>Track Application Status</a></p>
    <br/>
    <p>Best regards,<br/>EduGrant Admissions Team</p>
    """
    send_outreach_email(email, subject, body)

@router.post("", response_model=ApplicationResponse)
async def submit_application(payload: ApplicationPayload, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    app_id = uuid.uuid4()
    student_email = payload.form_data.get("email", "unknown@example.com")
    
    db_app = Application(
        application_id=app_id,
        scholarship_type=payload.scholarship_type,
        student_email=student_email,
        raw_payload=payload.form_data,
        status="received"
    )
    db.add(db_app)
    
    for s3_key in payload.attachments:
        db_attachment = Attachment(
            application_id=app_id,
            s3_key=s3_key,
            mime_type="application/pdf",
            original_filename=s3_key.split("/")[-1]
        )
        db.add(db_attachment)
    
    run_id = uuid.uuid4()
    db_run = AgentRun(
        run_id=run_id,
        application_id=app_id,
        graph_version="v1.0",
        status="active"
    )
    db.add(db_run)
    
    await db.commit()
    
    background_tasks.add_task(run_orchestrator, str(app_id), str(run_id))
    background_tasks.add_task(send_application_confirmation, student_email, str(app_id))

    
    return {"application_id": str(app_id), "run_id": str(run_id)}

@router.get("/{id}", response_model=ApplicationStatusResponse)
async def get_application_status(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get current node from LangGraph state if possible, or fallback to latest event
    config = {"configurable": {"thread_id": str(id)}}
    state = await graph.aget_state(config)
    
    # Get latest run_id
    run_result = await db.execute(
        select(AgentRun).where(AgentRun.application_id == id).order_by(AgentRun.started_at.desc()).limit(1)
    )
    db_run = run_result.scalar_one_or_none()
    
    return {
        "status": db_app.status,
        "run_id": str(db_run.run_id) if db_run else None,
        "current_node": state.next[0] if state and state.next else "completed",
        "last_event_at": db_app.updated_at,
        "missing_fields": state.values.get("missing_fields", []) if state else []
    }

@router.post("/{id}/reply")
async def student_reply(id: uuid.UUID, payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """
    Resumes the graph after student provides missing info.
    """
    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Add new attachments to DB
    new_attachments = payload.get("attachments", [])
    for s3_key in new_attachments:
        db_attachment = Attachment(
            application_id=id,
            s3_key=s3_key,
            mime_type="application/pdf",
            original_filename=s3_key.split("/")[-1]
        )
        db.add(db_attachment)
    
    # Update status back to 'received' or 'processing'
    db_app.status = "processing"
    await db.commit()

    # Update LangGraph state with new attachments and clear missing_fields
    config = {"configurable": {"thread_id": str(id)}}
    # We update the manifest in the state
    current_state = await graph.aget_state(config)
    manifest = current_state.values.get("attachment_manifest", [])
    for s3_key in new_attachments:
        manifest.append({"s3_key": s3_key, "filename": s3_key.split("/")[-1]})
    
    await graph.aupdate_state(config, {
        "attachment_manifest": manifest,
        "missing_fields": []
    })

    # Trigger resumption in background
    background_tasks.add_task(run_orchestrator, str(id), None, resume=True)
    
    return {"resumed": True}
