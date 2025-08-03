from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from .. import database, schemas, auth

router = APIRouter(prefix="/lessons", tags=["lessons"])

@router.post("/", response_model=schemas.Lesson)
def create_lesson(
    lesson: schemas.LessonCreate,
    current_user: database.User = Depends(auth.get_current_instructor),
    db: Session = Depends(database.get_db)
):
    # Verify the course belongs to the instructor
    course = db.query(database.Course).filter(database.Course.id == lesson.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add lessons to this course")
    
    db_lesson = database.Lesson(
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        order_index=lesson.order_index,
        is_published=lesson.is_published,
        course_id=lesson.course_id
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.get("/{lesson_id}", response_model=schemas.Lesson)
def get_lesson(
    lesson_id: int,
    current_user: database.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    lesson = db.query(database.Lesson).filter(database.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user has access to this lesson
    course = lesson.course
    is_enrolled = db.query(database.user_course_association)\
                   .filter_by(user_id=current_user.id, course_id=course.id).first()
    is_instructor = course.instructor_id == current_user.id
    
    if not is_enrolled and not is_instructor:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    if not lesson.is_published and not is_instructor:
        raise HTTPException(status_code=403, detail="Lesson not published")
    
    # Check if lesson is completed
    progress = db.query(database.LessonProgress)\
                .filter_by(user_id=current_user.id, lesson_id=lesson.id).first()
    lesson.is_completed = progress.is_completed if progress else False
    
    return lesson

@router.put("/{lesson_id}", response_model=schemas.Lesson)
def update_lesson(
    lesson_id: int,
    lesson_update: schemas.LessonUpdate,
    current_user: database.User = Depends(auth.get_current_instructor),
    db: Session = Depends(database.get_db)
):
    db_lesson = db.query(database.Lesson).filter(database.Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Verify the course belongs to the instructor
    if db_lesson.course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this lesson")
    
    update_data = lesson_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lesson, field, value)
    
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.delete("/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    current_user: database.User = Depends(auth.get_current_instructor),
    db: Session = Depends(database.get_db)
):
    db_lesson = db.query(database.Lesson).filter(database.Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Verify the course belongs to the instructor
    if db_lesson.course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this lesson")
    
    db.delete(db_lesson)
    db.commit()
    return {"message": "Lesson deleted successfully"}

@router.post("/{lesson_id}/complete")
def mark_lesson_complete(
    lesson_id: int,
    current_user: database.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    lesson = db.query(database.Lesson).filter(database.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user is enrolled in the course
    is_enrolled = db.query(database.user_course_association)\
                   .filter_by(user_id=current_user.id, course_id=lesson.course_id).first()
    if not is_enrolled:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Check if progress already exists
    progress = db.query(database.LessonProgress)\
                .filter_by(user_id=current_user.id, lesson_id=lesson_id).first()
    
    if progress:
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
    else:
        progress = database.LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            is_completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(progress)
    
    db.commit()
    return {"message": "Lesson marked as complete"}

@router.post("/{lesson_id}/uncomplete")
def mark_lesson_incomplete(
    lesson_id: int,
    current_user: database.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    lesson = db.query(database.Lesson).filter(database.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user is enrolled in the course
    is_enrolled = db.query(database.user_course_association)\
                   .filter_by(user_id=current_user.id, course_id=lesson.course_id).first()
    if not is_enrolled:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Update or create progress
    progress = db.query(database.LessonProgress)\
                .filter_by(user_id=current_user.id, lesson_id=lesson_id).first()
    
    if progress:
        progress.is_completed = False
        progress.completed_at = None
    else:
        progress = database.LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            is_completed=False
        )
        db.add(progress)
    
    db.commit()
    return {"message": "Lesson marked as incomplete"}

@router.get("/course/{course_id}", response_model=List[schemas.Lesson])
def get_course_lessons(
    course_id: int,
    current_user: database.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    course = db.query(database.Course).filter(database.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user has access to this course
    is_enrolled = db.query(database.user_course_association)\
                   .filter_by(user_id=current_user.id, course_id=course_id).first()
    is_instructor = course.instructor_id == current_user.id
    
    if not is_enrolled and not is_instructor:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Get lessons
    query = db.query(database.Lesson).filter(database.Lesson.course_id == course_id)
    if not is_instructor:
        query = query.filter(database.Lesson.is_published == True)
    
    lessons = query.order_by(database.Lesson.order_index).all()
    
    # Add completion status
    for lesson in lessons:
        progress = db.query(database.LessonProgress)\
                    .filter_by(user_id=current_user.id, lesson_id=lesson.id).first()
        lesson.is_completed = progress.is_completed if progress else False
    
    return lessons