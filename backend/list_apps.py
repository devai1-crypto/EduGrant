import asyncio
import uuid
from edugrant.state.db import async_session, Application
from sqlalchemy import select

async def check():
    async with async_session() as db:
        res = await db.execute(select(Application))
        apps = res.scalars().all()
        print(f"TOTAL APPLICATIONS: {len(apps)}")
        for a in apps:
            print(f"ID: {a.application_id} | Email: {a.student_email}")

if __name__ == "__main__":
    asyncio.run(check())
