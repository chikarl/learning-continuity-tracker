from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.models.user import User, UserRole, School, Class, StudentProfile
from app.models.lesson import Lesson
from app.core.security import get_password_hash
from datetime import datetime

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # 1. Create a School
        school = School(
            name="Unity Global School",
            region="North District",
            address="123 Peace Ave",
            contact="+1234567890"
        )
        db.add(school)
        db.commit()
        db.refresh(school)

        # 2. Create Users (Admin, Teacher, Student)
        admin = User(
            email="admin@unity.edu",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.SCHOOL_ADMIN,
            school_id=school.id
        )
        
        teacher = User(
            email="teacher@unity.edu",
            full_name="John Doe",
            hashed_password=get_password_hash("teacher123"),
            role=UserRole.TEACHER,
            school_id=school.id
        )

        student = User(
            email="student@unity.edu",
            full_name="Sarah Smith",
            hashed_password=get_password_hash("student123"),
            role=UserRole.STUDENT,
            school_id=school.id
        )

        db.add_all([admin, teacher, student])
        db.commit()

        # 3. Create a Class
        student_class = Class(
            name="Grade 10-A",
            level="Secondary",
            school_id=school.id,
            teacher_id=teacher.id
        )
        db.add(student_class)
        db.commit()
        db.refresh(student_class)

        # 4. Create Student Profile
        profile = StudentProfile(
            user_id=student.id,
            gender="Female",
            date_of_birth=datetime(2010, 5, 15),
            class_id=student_class.id
        )
        db.add(profile)

        # 5. Create Sample Lessons
        lessons = [
            Lesson(
                title="Introduction to Algebra",
                subject="Mathematics",
                class_level="Grade 10",
                topic="Equations",
                description="Basics of solving linear equations.",
                content_type="text",
                lockdown_week_reference=1,
                teacher_id=teacher.id
            ),
            Lesson(
                title="The Water Cycle",
                subject="Science",
                class_level="Grade 10",
                topic="Environment",
                description="Understanding evaporation and precipitation.",
                content_type="text",
                lockdown_week_reference=2,
                teacher_id=teacher.id
            ),
            Lesson(
                title="Medieval History",
                subject="History",
                class_level="Grade 10",
                topic="Civilizations",
                description="Key events of the Middle Ages.",
                content_type="text",
                lockdown_week_reference=3,
                teacher_id=teacher.id
            )
        ]
        db.add_all(lessons)
        db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
