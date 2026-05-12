import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from ..state.db import get_db, AgentRun, AgentEvent
from ..orchestrator.checkpointer import graph
from .deps import verify_admin_token

router = APIRouter(prefix="/api/runs", tags=["runs"])

@router.get("/{run_id}/events")
async def get_run_events(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentEvent)
        .where(AgentEvent.run_id == run_id)
        .order_by(AgentEvent.created_at.asc())
    )
    events = result.scalars().all()
    return events

@router.get("/{run_id}/state")
async def get_run_state(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Find application_id for this run
    run_result = await db.execute(select(AgentRun).where(AgentRun.run_id == run_id))
    db_run = run_result.scalar_one_or_none()
    if not db_run:
        raise HTTPException(status_code=404, detail="Run not found")
        
    config = {"configurable": {"thread_id": str(db_run.application_id)}}
    state = await graph.aget_state(config)
    
    if not state:
        return {"status": "not_started"}
        
    return {
        "values": state.values,
        "next": state.next,
        "metadata": state.metadata
    }
