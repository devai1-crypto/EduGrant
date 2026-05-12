import os
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import AsyncConnectionPool
from .graph import build_graph
from ..config import settings

# In production, we use PostgresSaver for persistence
# In development, we fallback to MemorySaver if no DB is configured
checkpointer = MemorySaver()

# We'll build the graph here
graph = build_graph(checkpointer)

# Note: For PostgresSaver, we need an active connection pool.
# This is usually initialized in the main.py startup or similar.
