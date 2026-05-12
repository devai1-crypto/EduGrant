import asyncio
import uuid
from edugrant.api.admin import override_decision
from edugrant.state.db import async_session

async def test():
    app_id = uuid.UUID('3c3fc5ae-c309-4a9c-94eb-122a6e57ca32')
    async with async_session() as db:
        try:
            print(f"Testing override for {app_id}")
            res = await override_decision(app_id, {'decision': 'rejected', 'reason': 'test'}, db)
            print(f"SUCCESS: {res}")
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
