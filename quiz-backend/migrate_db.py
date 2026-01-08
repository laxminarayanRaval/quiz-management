import asyncio
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print(f"Connecting to database... URL starts with {DATABASE_URL[:10]}...")
    engine = create_async_engine(
        DATABASE_URL, 
        echo=True,
        pool_pre_ping=True,
        connect_args={"timeout": 60}
    )
    print("Engine created. Beginning connection...")
    async with engine.begin() as conn:
        print("Connection established.")
        print("Checking if public_id column exists...")
        # Check column existence
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='quizzes' AND column_name='public_id';"
        ))
        if result.scalar():
            print("Column public_id already exists. Skipping migration.")
            return

        print("Adding public_id column...")
        await conn.execute(text("ALTER TABLE quizzes ADD COLUMN public_id VARCHAR;"))
        
        print("Populating public_id for existing quizzes...")
        result = await conn.execute(text("SELECT id FROM quizzes;"))
        quizzes = result.fetchall()
        for q in quizzes:
            await conn.execute(text(
                "UPDATE quizzes SET public_id = :uid WHERE id = :qid",
            ), {"uid": str(uuid.uuid4()), "qid": q.id})
            
        print("Setting public_id to NOT NULL and Unique...")
        await conn.execute(text("ALTER TABLE quizzes ALTER COLUMN public_id SET NOT NULL;"))
        await conn.execute(text("CREATE UNIQUE INDEX ix_quizzes_public_id ON quizzes (public_id);"))
        
        print("Migration complete.")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
