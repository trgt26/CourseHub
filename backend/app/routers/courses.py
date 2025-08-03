from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import database, schemas, auth

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[schemas.Course])
def get_courses(
    skip: int = 0, 
    limit: int = 100, 
    published_only: bool = True,
    db: Session = Depends(database.get_db)
):
    query = db.query(database.Course)
    if published_only:
        query = query.filter(database.Course.is_published == True)
    
    courses = query.offset(skip).limit(limit).all()
    
    # Add student count to each course
    for course in courses:
        student_count = db.query(func.count(database.user_course_association.c.user_id))\
                         .filter(database.user_course_association.c.course_id == course.id).scalar()
        course.student_count = student_count or 0
    
    return courses

@router.get("/{course_id}", response_model=schemas.CourseWithLessons)
def get_course(
    course_id: int, 
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    course = db.query(database.Course).filter(database.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user is enrolled or is the instructor
    is_enrolled = db.query(database.user_course_association)\
                   .filter_by(user_id=current_user.id, course_id=course_id).first()
    is_instructor = course.instructor_id == current_user.id
    
    if not course.is_published and not is_instructor:
        raise HTTPException(status_code=403, detail="Course not published")
    
    if not is_enrolled and not is_instructor:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Get lessons with completion status
    lessons = db.query(database.Lesson).filter(database.Lesson.course_id == course_id)\
               .order_by(database.Lesson.order_index).all()
    
    for lesson in lessons:
        progress = db.query(database.LessonProgress)\
                    .filter_by(user_id=current_user.id, lesson_id=lesson.id).first()
        lesson.is_completed = progress.is_completed if progress else False
    
    # Add student count
    student_count = db.query(func.count(database.user_course_association.c.user_id))\
                     .filter(database.user_course_association.c.course_id == course.id).scalar()
    course.student_count = student_count or 0
    
    return course

@router.post("/", response_model=schemas.Course)
def create_course(
    course: schemas.CourseCreate,
    current_user: database.User = Depends(auth.get_current_instructor),
    db: Session = Depends(database.get_db)
):
    db_course = database.Course(
        title=course.title,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        price=course.price,
        is_published=course.is_published,
        instructor_id=current_user.id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/{course_id}", response_model=schemas.Course)
def update_course(
    course_id: int,
    course_update: schemas.CourseUpdate,
    current_user: database.User = Depends(auth.get_current_instructor),
    db: Session = Depends(database.get_db)
):
    db_course = db.query(database.Course).filter(database.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if db_course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this course")
    
    update_data = course_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    current_user: database.User = Depends(auth.get_current_instructor),
    db: Session = Depends(database.get_db)
):
    db_course = db.query(database.Course).filter(database.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if db_course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")
    
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}

@router.post("/{course_id}/enroll")
def enroll_in_course(
    course_id: int,
    current_user: database.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    course = db.query(database.Course).filter(database.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not course.is_published:
        raise HTTPException(status_code=400, detail="Course not published")
    
    # Check if already enrolled
    existing_enrollment = db.query(database.user_course_association)\
                          .filter_by(user_id=current_user.id, course_id=course_id).first()
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Enroll user
    enrollment = database.user_course_association.insert().values(
        user_id=current_user.id,
        course_id=course_id
    )
    db.execute(enrollment)
    db.commit()
    
    return {"message": "Successfully enrolled in course"}

@router.get("/my/enrolled", response_model=List[schemas.Course])
def get_my_enrolled_courses(
    current_user: database.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    courses = db.query(database.Course)\
               .join(database.user_course_association)\
               .filter(database.user_course_association.c.user_id == current_user.id).all()
    
    # Add student count to each course
    for course in courses:
        student_count = db.query(func.count(database.user_course_association.c.user_id))\
                         .filter(database.user_course_association.c.course_id == course.id).scalar()
        course.student_count = student_count or 0
    
    return courses

@router.get("/my/created", response_model=List[schemas.Course])
def get_my_created_courses(
    current_user: database.User = Depends(auth.get_current_instructor),
    db: Session = Depends(database.get_db)
):
    courses = db.query(database.Course)\
               .filter(database.Course.instructor_id == current_user.id).all()
    
    # Add student count to each course
    for course in courses:
        student_count = db.query(func.count(database.user_course_association.c.user_id))\
                         .filter(database.user_course_association.c.course_id == course.id).scalar()
        course.student_count = student_count or 0
    
    return courses