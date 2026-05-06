from langgraph.checkpoint.memory import MemorySaver
from .graph import build_graph

# For MVP simplicity, we use MemorySaver. 
# In a real production environment, use PostgresSaver as specified in the design doc.
checkpointer = MemorySaver()

# Re-build graph with checkpointer
graph = build_graph(checkpointer)
