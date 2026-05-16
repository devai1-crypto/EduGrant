import asyncio
import uuid
import random
import json
from datetime import datetime, timedelta
from sqlalchemy import select
from ..state.db import async_session, Application, Attachment, Decision, AgentRun
from ..tools.s3 import get_s3_client
from ..config import settings

# Sample Data
FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
INSTITUTIONS = ["Stanford University", "MIT", "Harvard University", "UC Berkeley", "Oxford University", "Cambridge University", "ETH Zurich", "University of Tokyo", "Toronto University", "Georgia Tech"]

async def seed_data():
    print("Starting synthetic data seeding (50 applications)...")
    
    s3 = get_s3_client()
    # Ensure bucket exists if local
    if "localhost" in str(s3._endpoint):
        try:
            s3.create_bucket(Bucket=settings.R2_BUCKET)
            print(f"Created bucket: {settings.R2_BUCKET}")
        except Exception:
            pass

    async with async_session() as db:
        for i in range(50):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            email = f"{first_name.lower()}.{last_name.lower()}{i}@example.edu"
            app_id = uuid.uuid4()
            
            # Random status
            status = random.choice(["received", "processing", "approved", "rejected", "review"])
            
            # Create Application
            app = Application(
                application_id=app_id,
                scholarship_type="merit_undergrad",
                student_email=email,
                raw_payload={
                    "fullName": f"{first_name} {last_name}",
                    "email": email,
                    "institution": random.choice(INSTITUTIONS),
                    "gpa": round(random.uniform(3.2, 4.0), 2),
                    "annualIncome": random.randint(30000, 150000),
                    "essay_topic": "How AI will change education"
                },
                status=status,
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
            )
            db.add(app)
            
            # Create 2 dummy attachments
            for doc_type in ["transcript", "income_proof"]:
                doc_id = uuid.uuid4()
                s3_key = f"applications/{app_id}/{doc_type}.pdf"
                
                # Upload dummy content
                s3.put_object(
                    Bucket=settings.R2_BUCKET,
                    Key=s3_key,
                    Body=b"%PDF-1.4\n%Dummy PDF content for demo",
                    ContentType="application/pdf"
                )
                
                attachment = Attachment(
                    attachment_id=doc_id,
                    application_id=app_id,
                    s3_key=s3_key,
                    mime_type="application/pdf",
                    original_filename=f"{doc_type}_final.pdf"
                )
                db.add(attachment)

            # If finalized, add a decision record
            if status in ["approved", "rejected"]:
                score = random.randint(85, 100) if status == "approved" else random.randint(40, 70)
                decision = Decision(
                    decision_id=uuid.uuid4(),
                    application_id=app_id,
                    final_decision=status,
                    eligibility_score=score,
                    reasoning_text=f"Synthetic decision: This student has a {score}/100 merit score based on GPA and community impact.",
                    decided_by="agent" if random.random() > 0.2 else "admin",
                    decided_at=datetime.utcnow()
                )
                db.add(decision)
            
            # Add an AgentRun for trace visibility
            run_id = uuid.uuid4()
            run = AgentRun(
                run_id=run_id,
                application_id=app_id,
                graph_version="v1.0",
                status="completed" if status in ["approved", "rejected", "review"] else "active",
                final_decision=status if status in ["approved", "rejected", "review"] else None
            )
            db.add(run)

        await db.commit()
        print(f"Seeding complete. 50 applications injected into {settings.DATABASE_URL}")

if __name__ == "__main__":
    asyncio.run(seed_data())
