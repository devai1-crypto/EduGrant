import asyncio
import uuid
import os
from edugrant.api.admin import get_application_detail
from edugrant.state.db import async_session

async def test():
    # Use the ID from the user's screenshot
    app_id = uuid.UUID('2a5b5a9f-c0ac-4698-b7cf-543aa03f820a')
    async with async_session() as db:
        try:
            print(f"Testing application detail for {app_id}")
            res = await get_application_detail(app_id, db)
            print("SUCCESS")
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
