import asyncio
from edugrant.state.db import engine
from sqlalchemy import text

async def fix():
    async with engine.begin() as conn:
        print("Dropping NOT NULL constraint on decisions.run_id...")
        await conn.execute(text('ALTER TABLE decisions ALTER COLUMN run_id DROP NOT NULL'))
        print("SUCCESS")

if __name__ == "__main__":
    asyncio.run(fix())
