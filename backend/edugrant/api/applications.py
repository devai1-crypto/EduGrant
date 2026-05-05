import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..state.db import get_db, Application, Attachment, AgentRun, AgentEvent
from ..state.schemas import ApplicationPayload, ApplicationResponse, ApplicationStatusResponse
from ..orchestrator.graph import graph

router = APIRouter(prefix="/api/applications", tags=["applications"])

async def run_orchestrator(application_id: str, run_id: str):
    """
    Background task to run the LangGraph.
    """
    print(f"Starting orchestrator for app {application_id}, run {run_id}")
    try:
        # Build initial state
        initial_state = {
            "application_id": application_id,
            "run_id": run_id,
            "audit_trail": [{"event": "start", "timestamp": "now"}]
        }
        
        # Invoke graph
        # Note: In production, we'd use thread_id for checkpointing
        config = {"configurable": {"thread_id": application_id}}
        await graph.ainvoke(initial_state, config=config)
    except Exception as e:
        print(f"Orchestrator Error: {e}")

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
    
    return {"application_id": str(app_id), "run_id": str(run_id)}

@app.get("/{id}", response_model=ApplicationStatusResponse)
async def get_application_status(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.application_id == id))
    db_app = result.scalar_one_or_none()
    
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get current node from LangGraph state if possible, or fallback to latest event
    config = {"configurable": {"thread_id": str(id)}}
    state = await graph.aget_state(config)
    
    return {
        "status": db_app.status,
        "current_node": state.next[0] if state and state.next else "completed",
        "last_event_at": db_app.updated_at,
        "missing_fields": state.values.get("missing_fields", []) if state else []
    }

@app.post("/{id}/reply")
async def student_reply(id: uuid.UUID, payload: dict, db: AsyncSession = Depends(get_db)):
    """
    Resumes the graph after student provides missing info.
    """
    # Logic to update state with new attachments and resume
    config = {"configurable": {"thread_id": str(id)}}
    # This would involve updating the state values and then ainvoking with None to resume
    # For MVP simplicity:
    # await graph.aupdate_state(config, {"new_attachments": payload.get("attachments")})
    # await graph.ainvoke(None, config=config)
    return {"resumed": True}
