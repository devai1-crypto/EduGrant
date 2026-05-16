import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, JSON, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
from ..config import settings

class Base(AsyncAttrs, DeclarativeBase):
    pass

class Application(Base):
    __tablename__ = "applications"
    
    application_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    scholarship_type: Mapped[str] = mapped_column(String(50))
    student_email: Mapped[str] = mapped_column(String(255))
    raw_payload: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(50), default="received")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    attachments: Mapped[List["Attachment"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    runs: Mapped[List["AgentRun"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    decisions: Mapped[List["Decision"]] = relationship(back_populates="application", cascade="all, delete-orphan")


class Attachment(Base):
    __tablename__ = "attachments"
    
    attachment_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.application_id"))
    s3_key: Mapped[str] = mapped_column(String(512))
    mime_type: Mapped[str] = mapped_column(String(100))
    original_filename: Mapped[str] = mapped_column(String(255))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    application: Mapped["Application"] = relationship(back_populates="attachments")

class AgentRun(Base):
    __tablename__ = "agent_runs"
    
    run_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.application_id"))
    graph_version: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    final_decision: Mapped[Optional[str]] = mapped_column(String(50))
    total_cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    
    application: Mapped["Application"] = relationship(back_populates="runs")
    events: Mapped[List["AgentEvent"]] = relationship(back_populates="run", cascade="all, delete-orphan")


class AgentEvent(Base):
    __tablename__ = "agent_events"
    
    event_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agent_runs.run_id"))
    node_name: Mapped[str] = mapped_column(String(100))
    event_type: Mapped[str] = mapped_column(String(50)) # start, end, error
    input_summary: Mapped[Optional[dict]] = mapped_column(JSON)
    output_summary: Mapped[Optional[dict]] = mapped_column(JSON)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer)
    model_used: Mapped[Optional[str]] = mapped_column(String(50))
    tokens_in: Mapped[Optional[int]] = mapped_column(Integer)
    tokens_out: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    run: Mapped["AgentRun"] = relationship(back_populates="events")

class Decision(Base):
    __tablename__ = "decisions"
    
    decision_id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("applications.application_id"))
    run_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("agent_runs.run_id"))
    final_decision: Mapped[str] = mapped_column(String(50))
    eligibility_score: Mapped[int] = mapped_column(Integer)
    reasoning_text: Mapped[str] = mapped_column(String)
    decided_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    decided_by: Mapped[str] = mapped_column(String(100)) # 'agent' or human user_id
    
    application: Mapped["Application"] = relationship(back_populates="decisions")

# Database setup
engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session
