from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    is_instructor: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_instructor: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Course schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: int = 0
    is_published: bool = False

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: Optional[int] = None
    is_published: Optional[bool] = None

class Course(CourseBase):
    id: int
    instructor_id: int
    created_at: datetime
    updated_at: datetime
    instructor: User
    student_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Lesson schemas
class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int = 0
    is_published: bool = False

class LessonCreate(LessonBase):
    course_id: int

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None

class Lesson(LessonBase):
    id: int
    course_id: int
    created_at: datetime
    is_completed: Optional[bool] = False

    class Config:
        from_attributes = True

# Course with lessons
class CourseWithLessons(Course):
    lessons: List[Lesson] = []

# Progress schemas
class LessonProgressCreate(BaseModel):
    lesson_id: int
    is_completed: bool = True

class LessonProgress(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    is_completed: bool
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Enrollment schema
class EnrollmentCreate(BaseModel):
    course_id: int

# Dashboard schemas
class DashboardStats(BaseModel):
    total_courses: int
    enrolled_courses: int
    completed_lessons: int
    total_students: Optional[int] = None  # For instructors