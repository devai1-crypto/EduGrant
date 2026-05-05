import time
from functools import wraps
from ..state.db import AgentEvent, async_session

def audit_event(node_name: str):
    """
    Decorator to log agent events to the database.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(state, *args, **kwargs):
            start_time = time.time()
            event_type = "start"
            
            # Create start event
            # In a real async environment, we'd handle this carefully with the session
            # For brevity, we focus on the 'end' event with latency
            
            result = await func(state, *args, **kwargs)
            
            end_time = time.time()
            latency = int((end_time - start_time) * 1000)
            
            async with async_session() as db:
                event = AgentEvent(
                    run_id=state["run_id"],
                    node_name=node_name,
                    event_type="end",
                    input_summary={"state_keys": list(state.keys())},
                    output_summary={"updates": list(result.keys())},
                    latency_ms=latency
                )
                db.add(event)
                await db.commit()
            
            return result
        return wrapper
    return decorator
