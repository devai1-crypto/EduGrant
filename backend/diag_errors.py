import asyncio
import uuid
from edugrant.state.db import async_session, AgentEvent
from sqlalchemy import select

async def check():
    async with async_session() as db:
        res = await db.execute(select(AgentEvent).where(AgentEvent.event_type == 'error').order_by(AgentEvent.created_at.desc()))
        err = res.scalars().first()
        if err:
            print(f"FOUND ERROR: {err.output_summary}")
        else:
            print("No error found in AgentEvent table.")

if __name__ == "__main__":
    asyncio.run(check())
