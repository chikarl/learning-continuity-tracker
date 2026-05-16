from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.lesson import StudentProgress, Lesson
from app.services.gap_engine import LearningGapService
from datetime import datetime

router = APIRouter()

@router.post("/complete/{lesson_id}")
def mark_lesson_complete(
    lesson_id: int,
    student_id: int, # This would come from JWT in real app
    db: Session = Depends(get_db)
):
    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == student_id,
        StudentProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = StudentProgress(student_id=student_id, lesson_id=lesson_id)
        db.add(progress)
    
    progress.status = "completed"
    progress.completed_at = datetime.utcnow()
    db.commit()

    # Recalculate gap after each completion
    LearningGapService.calculate_gap(db, student_id)
    
    return {"status": "success"}

@router.get("/learning-gap/{student_id}")
def get_student_gap(student_id: int, db: Session = Depends(get_db)):
    report = LearningGapService.get_student_report(db, student_id)
    if not report:
        # Calculate it if it doesn't exist
        report = LearningGapService.calculate_gap(db, student_id)
    return report
