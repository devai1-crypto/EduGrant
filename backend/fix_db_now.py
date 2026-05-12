import asyncio
from edugrant.state.db import async_session
from sqlalchemy import text

async def fix():
    print("Connecting to DB to drop NOT NULL constraint on run_id...")
    async with async_session() as db:
        try:
            await db.execute(text('ALTER TABLE decisions ALTER COLUMN run_id DROP NOT NULL;'))
            await db.commit()
            print("Successfully dropped NOT NULL constraint!")
        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(fix())
