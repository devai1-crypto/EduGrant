import time
from datetime import datetime
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
            
            # 1. Log START event
            async with async_session() as db:
                start_event = AgentEvent(
                    run_id=state["run_id"],
                    node_name=node_name,
                    event_type="start",
                    input_summary={"state_keys": list(state.keys())},
                    created_at=datetime.utcnow()
                )
                db.add(start_event)
                await db.commit()
            
            try:
                # Execute the agent
                result = await func(state, *args, **kwargs)
                
                end_time = time.time()
                latency = int((end_time - start_time) * 1000)
                
                # 2. Log END event
                async with async_session() as db:
                    end_event = AgentEvent(
                        run_id=state["run_id"],
                        node_name=node_name,
                        event_type="end",
                        output_summary={"updates": list(result.keys())},
                        latency_ms=latency,
                        created_at=datetime.utcnow()
                    )
                    db.add(end_event)
                    await db.commit()
                
                return result
            except Exception as e:
                # 3. Log ERROR event
                async with async_session() as db:
                    error_event = AgentEvent(
                        run_id=state["run_id"],
                        node_name=node_name,
                        event_type="error",
                        output_summary={"error": str(e)},
                        created_at=datetime.utcnow()
                    )
                    db.add(error_event)
                    await db.commit()
                raise e
        return wrapper
    return decorator

