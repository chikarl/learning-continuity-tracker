from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, schools, lessons, progress
from app.db.session import engine, Base
import os

# Create tables (In a real app, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Learning Continuity Tracker API",
    description="Backend for offline-first educational platform for conflict-affected regions.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically (PDFs, videos, etc.)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(schools.router, prefix="/schools", tags=["Schools"])
app.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
app.include_router(progress.router, prefix="/progress", tags=["Progress"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Learning Continuity Tracker API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

