from fastapi import FastAPI
from db import engine, Base
from routes import router
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Quiz Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(router, tags=["Quizzes"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Quiz Management API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
