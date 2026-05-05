from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from .api import applications, admin, runs
from .config import settings
from .orchestrator.graph import build_graph, graph
from .state.db import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and LangGraph checkpointer if needed
    # In a real setup with PostgresSaver:
    # checkpointer = PostgresSaver(engine)
    # await checkpointer.setup()
    # global graph
    # graph = build_graph(checkpointer)
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
