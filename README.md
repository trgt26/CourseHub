# Course Management System

A comprehensive online course management system built with FastAPI backend and Next.js frontend.

## 🚀 Features

### For Students:
- **Course Discovery**: Browse and search available courses
- **Enrollment**: Enroll in courses with one click
- **Progress Tracking**: Track lesson completion and overall progress
- **Interactive Learning**: Access video content and lesson materials
- **Dashboard**: Personal dashboard with learning statistics

### For Instructors:
- **Course Creation**: Create and manage courses with rich content
- **Lesson Management**: Add, edit, and organize lessons with video content
- **Student Analytics**: Monitor student progress and engagement
- **Content Publishing**: Control course and lesson visibility
- **Student Management**: View enrolled students per course

### General Features:
- **User Authentication**: Secure registration and login system
- **Role-based Access**: Different permissions for students and instructors
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean and intuitive user interface with Tailwind CSS
- **Real-time Updates**: Dynamic content updates without page refresh

## 🛠️ Tech Stack

### Backend:
- **FastAPI**: Modern, fast web framework for Python APIs
- **SQLAlchemy**: SQL toolkit and ORM for database operations
- **SQLite**: Lightweight database (easily switchable to PostgreSQL)
- **JWT Authentication**: Secure token-based authentication
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI web server for Python

### Frontend:
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management
- **React Hook Form**: Performant forms with easy validation
- **Lucide React**: Beautiful and consistent icons

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Python 3.8+** (Python 3.11+ recommended)
- **Node.js 18+** (Node.js 20+ recommended)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

### Check your installations:
```bash
python3 --version  # Should show 3.8 or higher
node --version     # Should show 18 or higher
npm --version      # Should show 8 or higher
```

## 🚀 Quick Start

### Option 1: Using the Startup Script (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd course-management-system
   ```

2. **Run the startup script:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

   This script will:
   - Create Python virtual environment
   - Install all dependencies
   - Set up environment files
   - Create database tables
   - Start both backend and frontend servers

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

#### Backend Setup:

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file if needed
   ```

5. **Create database tables:**
   ```bash
   python -c "from app.database import create_tables; create_tables()"
   ```

6. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Frontend Setup:

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local if needed
   ```

4. **Start the frontend server:**
   ```bash
   npm run dev
   ```

## 📚 Usage Guide

### Getting Started:

1. **Register an Account:**
   - Go to http://localhost:3000/register
   - Choose "Student" or "Instructor" during registration
   - Complete the registration form

2. **Login:**
   - Go to http://localhost:3000/login
   - Use your credentials to sign in

### For Students:

1. **Browse Courses:**
   - Visit the home page to see available courses
   - Use search and filters to find specific courses

2. **Enroll in Courses:**
   - Click on a course to view details
   - Click "Enroll" to join the course

3. **Learn:**
   - Access enrolled courses from your dashboard
   - Complete lessons and track your progress

### For Instructors:

1. **Create Courses:**
   - Go to your dashboard
   - Click "Create New Course"
   - Fill in course details and publish

2. **Add Lessons:**
   - Enter your course
   - Click "Add Lesson"
   - Upload content and organize lessons

3. **Manage Students:**
   - View enrolled students
   - Track student progress
   - Monitor course analytics

## 🔧 Configuration

### Environment Variables:

#### Backend (.env):
```env
DATABASE_URL=sqlite:///./course_management.db
SECRET_KEY=your-secret-key-here-change-in-production
```

#### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Configuration:

The system uses SQLite by default for easy setup. To use PostgreSQL:

1. Install PostgreSQL
2. Update `DATABASE_URL` in backend/.env:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/course_management
   ```
3. Install psycopg2-binary: `pip install psycopg2-binary`

## 🏗️ Project Structure

```
course-management-system/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI app and routes
│   │   ├── database.py     # Database models and config
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # Authentication utilities
│   │   └── routers/        # API route modules
│   │       ├── auth.py     # Authentication routes
│   │       ├── courses.py  # Course management routes
│   │       ├── lessons.py  # Lesson management routes
│   │       └── dashboard.py # Dashboard and stats routes
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example       # Environment variables template
│   └── venv/              # Virtual environment (created)
├── frontend/               # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── dashboard/     # Dashboard page
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI components
│   │   └── Layout/       # Layout components
│   ├── lib/              # Utilities and configuration
│   │   ├── api.ts        # API client
│   │   ├── contexts/     # React contexts
│   │   └── providers/    # React providers
│   ├── package.json      # Node.js dependencies
│   ├── .env.local.example # Environment variables template
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── tsconfig.json     # TypeScript configuration
│   └── node_modules/     # Node.js modules (created)
├── start.sh              # Startup script
└── README.md            # This file
```

## 🧪 API Documentation

When the backend is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key API Endpoints:

#### Authentication:
- `POST /auth/register` - User registration
- `POST /auth/token` - User login
- `GET /auth/me` - Get current user info

#### Courses:
- `GET /courses/` - List all courses
- `POST /courses/` - Create new course (instructors only)
- `GET /courses/{id}` - Get course details
- `PUT /courses/{id}` - Update course (instructor only)
- `POST /courses/{id}/enroll` - Enroll in course

#### Lessons:
- `GET /courses/{course_id}/lessons` - Get course lessons
- `POST /lessons/` - Create lesson (instructors only)
- `PUT /lessons/{id}` - Update lesson (instructor only)
- `POST /lessons/{id}/progress` - Mark lesson as completed

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use:**
   ```bash
   # Kill existing processes
   pkill -f "uvicorn.*8000"  # Backend
   pkill -f "next.*3000"     # Frontend
   ```

2. **Python virtual environment issues:**
   ```bash
   # Remove and recreate venv
   rm -rf backend/venv
   cd backend && python3 -m venv venv
   ```

3. **Node.js dependency issues:**
   ```bash
   # Clear npm cache and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Database issues:**
   ```bash
   # Delete and recreate database
   rm backend/course_management.db
   cd backend && python -c "from app.database import create_tables; create_tables()"
   ```

### Getting Help:

- Check the API documentation at http://localhost:8000/docs
- Look at the browser console for frontend errors
- Check terminal output for backend errors
- Ensure all environment variables are properly set

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request