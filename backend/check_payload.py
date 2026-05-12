import asyncio
from edugrant.state.db import async_session, Application
from sqlalchemy import select

async def check():
    async with async_session() as db:
        res = await db.execute(select(Application).limit(1))
        app = res.scalar_one_or_none()
        if app:
            print(f"PAYLOAD: {app.raw_payload}")
        else:
            print("No applications found.")

if __name__ == "__main__":
    asyncio.run(check())
