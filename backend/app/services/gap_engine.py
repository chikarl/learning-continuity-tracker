from sqlalchemy.orm import Session
from app.models.lesson import Lesson, StudentProgress, LearningGap
from app.models.user import User
from datetime import datetime
import json

class LearningGapService:
    @staticmethod
    def calculate_gap(db: Session, student_id: int):
        # 1. Get student profile and class
        student = db.query(User).filter(User.id == student_id).first()
        if not student or not student.school_id:
            return None

        # 2. Get all lessons expected for this student's level
        # For simplicity, we assume lessons matching the student's class level
        # In a real app, this would be filtered by subject and academic calendar
        expected_lessons = db.query(Lesson).count() # Placeholder logic
        
        # 3. Get completed lessons
        completed_lessons = db.query(StudentProgress).filter(
            StudentProgress.student_id == student_id,
            StudentProgress.status == "completed"
        ).count()

        # 4. Calculate percentage
        if expected_lessons == 0:
            gap_percentage = 0.0
        else:
            gap_percentage = max(0, (1 - (completed_lessons / expected_lessons)) * 100)

        # 5. Determine risk level
        risk_level = "low"
        if gap_percentage > 40:
            risk_level = "high"
        elif gap_percentage > 15:
            risk_level = "medium"

        # 6. Generate recommendations
        recommendations = [
            "Complete missed lessons from Week 3",
            "Review core concepts in Mathematics",
            "Schedule a catch-up session with teacher"
        ]

        # 7. Update or Create LearningGap record
        gap_record = db.query(LearningGap).filter(LearningGap.student_id == student_id).first()
        if not gap_record:
            gap_record = LearningGap(student_id=student_id)
            db.add(gap_record)
        
        gap_record.total_expected_lessons = expected_lessons
        gap_record.total_completed_lessons = completed_lessons
        gap_record.gap_percentage = gap_percentage
        gap_record.risk_level = risk_level
        gap_record.recommendations = recommendations
        gap_record.calculated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(gap_record)
        return gap_record

    @staticmethod
    def get_student_report(db: Session, student_id: int):
        return db.query(LearningGap).filter(LearningGap.student_id == student_id).first()
