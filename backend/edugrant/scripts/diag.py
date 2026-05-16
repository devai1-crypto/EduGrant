import asyncio
from sqlalchemy import select
from edugrant.state.db import async_session, Application, Institution

async def diag():
    async with async_session() as db:
        print("Checking Institutions...")
        res = await db.execute(select(Institution))
        for inst in res.scalars().all():
            print(f"ID: {inst.id}, Name: {inst.name}")
            
        print("\nChecking Applications...")
        res = await db.execute(select(Application))
        apps = res.scalars().all()
        if not apps:
            print("No applications found.")
        for app in apps:
            print(f"ID: {app.application_id}, Target: {app.target_institution}, Status: {app.status}")

if __name__ == "__main__":
    asyncio.run(diag())
