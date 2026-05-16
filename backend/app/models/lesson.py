from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    subject = Column(String)
    class_level = Column(String)
    topic = Column(String)
    description = Column(Text)
    content_type = Column(String) # pdf, text, audio, video
    content_url = Column(String)
    lockdown_week_reference = Column(Integer)
    estimated_duration = Column(Integer) # in minutes
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    status = Column(String, default="pending") # pending, completed
    completed_at = Column(DateTime(timezone=True), nullable=True)
    sync_status = Column(String, default="synced") # synced, pending_sync

class LearningGap(Base):
    __tablename__ = "learning_gaps"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    total_expected_lessons = Column(Integer)
    total_completed_lessons = Column(Integer)
    gap_percentage = Column(Float)
    missed_weeks = Column(Integer)
    risk_level = Column(String) # low, medium, high
    recommendations = Column(JSON)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    due_date = Column(DateTime)
    max_points = Column(Integer, default=100)
    
    lesson = relationship("Lesson")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content_url = Column(String) # For file uploads
    answer_text = Column(Text)
    grade = Column(Float, nullable=True)
    feedback = Column(Text)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    assignment = relationship("Assignment", back_populates="submissions")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    
    questions = relationship("Question", back_populates="quiz")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    text = Column(Text)
    question_type = Column(String) # MCQ, True/False, FillIn
    options = Column(JSON) # For MCQs
    correct_answer = Column(String)
    
    quiz = relationship("Quiz", back_populates="questions")
