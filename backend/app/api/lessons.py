from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.lesson import Lesson
from app.schemas.user import Lesson as LessonSchema, LessonBase
import os
import shutil
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads/lessons"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "video/mp4": "video",
    "video/webm": "video",
    "text/plain": "text",
    "image/jpeg": "image",
    "image/png": "image",
}

# ─── READ ────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[LessonSchema])
def get_lessons(db: Session = Depends(get_db)):
    return db.query(Lesson).all()

@router.get("/{lesson_id}", response_model=LessonSchema)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

# ─── CREATE (metadata only) ──────────────────────────────────────────────────

@router.post("/", response_model=LessonSchema)
def create_lesson(lesson_in: LessonBase, db: Session = Depends(get_db)):
    db_lesson = Lesson(**lesson_in.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

# ─── CREATE WITH FILE (multipart, single-request) ────────────────────────────

@router.post("/upload", response_model=LessonSchema)
async def create_lesson_with_file(
    title: str = Form(...),
    subject: str = Form(...),
    class_level: str = Form(...),
    topic: str = Form(...),
    description: str = Form(...),
    estimated_duration: Optional[int] = Form(None),
    lockdown_week_reference: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    # Determine content type from file MIME or default to text
    content_type = "text"
    content_url = None

    if file and file.filename:
        mime = file.content_type or ""
        if mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {mime}. Allowed: PDF, MP4, WebM, TXT, JPG, PNG"
            )
        content_type = ALLOWED_MIME_TYPES[mime]

        # Unique filename to avoid collisions
        ext = os.path.splitext(file.filename)[1]
        safe_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        content_url = file_path

    db_lesson = Lesson(
        title=title,
        subject=subject,
        class_level=class_level,
        topic=topic,
        description=description,
        content_type=content_type,
        content_url=content_url,
        estimated_duration=estimated_duration,
        lockdown_week_reference=lockdown_week_reference,
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

# ─── ATTACH FILE to existing lesson ──────────────────────────────────────────

@router.post("/{lesson_id}/upload")
async def upload_resource(
    lesson_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    mime = file.content_type or ""
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {mime}")

    ext = os.path.splitext(file.filename)[1]
    safe_name = f"{lesson_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    lesson.content_url = file_path
    lesson.content_type = ALLOWED_MIME_TYPES[mime]
    db.commit()
    return {"filename": file.filename, "url": file_path, "content_type": lesson.content_type}

# ─── DELETE ──────────────────────────────────────────────────────────────────

@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Remove attached file if any
    if lesson.content_url and os.path.exists(lesson.content_url):
        os.remove(lesson.content_url)

    db.delete(lesson)
    db.commit()
    return {"status": "deleted", "id": lesson_id}

