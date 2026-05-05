import uuid
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from .state.db import get_db, Application, Attachment, AgentRun, AgentEvent
from .state.schemas import ApplicationPayload, ApplicationResponse, ApplicationStatusResponse, AdminApplicationSummary
from .orchestrator.graph import graph

app = FastAPI(
    title="EduGrant AI API",
    description="Multi-agent scholarship application automation system",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}

# --- Student Endpoints ---

async def run_orchestrator(application_id: str, run_id: str):
    # This will be implemented in Step 3 (Agent Logic)
    # For now it's a placeholder to satisfy the BackgroundTask requirement
    print(f"Starting orchestrator for app {application_id}, run {run_id}")
    # await graph.ainvoke(...)

@app.post("/api/applications", response_model=ApplicationResponse)
async def submit_application(payload: ApplicationPayload, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # 1. Create Application record
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
    
    # 2. Create Attachment records
    for s3_key in payload.attachments:
        db_attachment = Attachment(
            application_id=app_id,
            s3_key=s3_key,
            mime_type="application/pdf", # Assumption for MVP
            original_filename=s3_key.split("/")[-1]
        )
        db.add(db_attachment)
    
    # 3. Initialize Agent Run
    run_id = uuid.uuid4()
    db_run = AgentRun(
        run_id=run_id,
        application_id=app_id,
        graph_version="v1.0",
        status="active"
    )
    db.add(db_run)
    
    await db.commit()
    
    # 4. Trigger LangGraph in background
    background_tasks.add_task(run_orchestrator, str(app_id), str(run_id))
    
    return {"application_id": str(app_id), "run_id": str(run_id)}

@app.get("/api/applications/{application_id}", response_model=ApplicationStatusResponse)
async def get_application_status(application_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.application_id == application_id))
    db_app = result.scalar_one_or_none()
    
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get the latest event for this application's active run
    event_result = await db.execute(
        select(AgentEvent)
        .join(AgentRun)
        .where(AgentRun.application_id == application_id)
        .order_by(AgentEvent.created_at.desc())
        .limit(1)
    )
    latest_event = event_result.scalar_one_or_none()
    
    return {
        "status": db_app.status,
        "current_node": latest_event.node_name if latest_event else "triage",
        "last_event_at": latest_event.created_at if latest_event else db_app.created_at,
        "missing_fields": [] # Populated by agents later
    }

# --- Admin Endpoints ---

@app.get("/api/admin/queue", response_model=List[AdminApplicationSummary])
async def get_admin_queue(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).order_by(Application.created_at.desc()))
    apps = result.scalars().all()
    
    summaries = []
    for app in apps:
        summaries.append({
            "application_id": str(app.application_id),
            "student_name": app.raw_payload.get("fullName", "Unknown"),
            "gpa": float(app.raw_payload.get("gpa", 0.0)),
            "status": app.status
        })
    return summaries

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

