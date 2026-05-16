import asyncio
import uuid
from edugrant.state.db import async_session, Institution, Application, Base, engine

async def seed_institutions():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if already seeded
        from sqlalchemy import select
        res = await db.execute(select(Institution))
        if res.scalars().first():
            print("Institutions already seeded.")
            return

        print("Seeding institutions with custom rubrics...")
        
        # Stanford: Academic Heavy
        stanford_rubric = {
            "name": "Stanford Excellence Grant",
            "criteria": [
                {"name": "GPA", "weight": 0.6, "rubric": {"4.0": 100, "3.5-3.9": 80, "<3.5": 20}},
                {"name": "Extracurriculars", "weight": 0.4, "rubric": {"Leader": 100, "Member": 50}}
            ]
        }
        
        # Harvard: Leadership & Essay Heavy
        harvard_rubric = {
            "name": "Harvard Leadership Scholarship",
            "criteria": [
                {"name": "Leadership Essay", "weight": 0.5, "rubric": {"Inspiring": 100, "Good": 70, "Poor": 10}},
                {"name": "Academic Record", "weight": 0.3, "rubric": {"Top 5%": 100, "Top 20%": 70}},
                {"name": "Community Impact", "weight": 0.2, "rubric": {"High": 100, "None": 0}}
            ]
        }
        
        # MIT: Technical Merit
        mit_rubric = {
            "name": "MIT Innovation Award",
            "criteria": [
                {"name": "Technical Credits", "weight": 0.5, "rubric": {">100": 100, "50-100": 60}},
                {"name": "Project Portfolio", "weight": 0.5, "rubric": {"Innovative": 100, "Standard": 40}}
            ]
        }

        institutes = [
            Institution(id="stanford", name="Stanford University", admin_password="stanford_admin_123", rubric=stanford_rubric),
            Institution(id="harvard", name="Harvard University", admin_password="harvard_admin_456", rubric=harvard_rubric),
            Institution(id="mit", name="Massachusetts Institute of Technology", admin_password="mit_admin_789", rubric=mit_rubric),
            Institution(id="edugrant", name="EduGrant Global", admin_password="13092025", rubric=stanford_rubric),
        ]
        
        # Use merge to update existing ones if needed
        for inst in institutes:
            await db.merge(inst)
            
        await db.commit()
        print("Done seeding institutions.")

if __name__ == "__main__":
    asyncio.run(seed_institutions())
