from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from .api import applications, admin, runs
from .config import settings
from .orchestrator.checkpointer import graph
from .state.db import engine

from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import AsyncConnectionPool
from .orchestrator.graph import build_graph
from .orchestrator import checkpointer as cp

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize LangGraph checkpointer with Postgres if available
    if settings.DATABASE_URL.startswith("postgresql"):
        # Psycopg (v3) used by PostgresSaver expects 'postgresql://' not 'postgresql+asyncpg://'
        connection_url = settings.DATABASE_URL.replace("+asyncpg", "")
        async with AsyncConnectionPool(connection_url, max_size=20) as pool:
            checkpointer = PostgresSaver(pool)
            # await checkpointer.setup() # Usually handled by the app or migrations
            cp.graph = build_graph(checkpointer)
            yield
    else:
        yield
    
    # Shutdown: Clean up resources
    await engine.dispose()

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Multi-agent scholarship application automation system",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(applications.router)
app.include_router(admin.router)
app.include_router(runs.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.API_VERSION}

if __name__ == "__main__":
    uvicorn.run("edugrant.main:app", host="0.0.0.0", port=8000, reload=True)
