from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import database, schemas, auth

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: database.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    # Total courses available
    total_courses = db.query(func.count(database.Course.id))\
                     .filter(database.Course.is_published == True).scalar()
    
    # Enrolled courses
    enrolled_courses = db.query(func.count(database.user_course_association.c.course_id))\
                        .filter(database.user_course_association.c.user_id == current_user.id).scalar()
    
    # Completed lessons
    completed_lessons = db.query(func.count(database.LessonProgress.id))\
                         .filter(
                             database.LessonProgress.user_id == current_user.id,
                             database.LessonProgress.is_completed == True
                         ).scalar()
    
    stats = {
        "total_courses": total_courses or 0,
        "enrolled_courses": enrolled_courses or 0,
        "completed_lessons": completed_lessons or 0
    }
    
    # Add instructor-specific stats
    if current_user.is_instructor:
        total_students = db.query(func.count(database.user_course_association.c.user_id.distinct()))\
                          .join(database.Course)\
                          .filter(database.Course.instructor_id == current_user.id).scalar()
        stats["total_students"] = total_students or 0
    
    return stats