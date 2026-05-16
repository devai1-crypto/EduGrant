import asyncio
from edugrant.state.db import Base, engine, Institution, Application, AgentRun, AgentEvent, Decision, Attachment
from edugrant.scripts.seed_institutions import seed_institutions

async def reset_db():
    print("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    
    print("Re-seeding institutions...")
    await seed_institutions()
    print("Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset_db())
