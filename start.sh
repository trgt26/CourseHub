#!/bin/bash

# Course Management System Startup Script

echo "🚀 Starting Course Management System..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check if Python is installed
if ! command_exists python3 && ! command_exists python; then
    echo "❌ Python is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Dependencies check passed!"

# Create virtual environment for backend if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Check for environment file
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from example..."
    cp .env.example .env
fi

echo "🗄️ Creating database tables..."
python -c "from app.database import create_tables; create_tables()"

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local file from example..."
    cp .env.local.example .env.local
fi

cd ..

# Kill existing processes on ports if they exist
if port_in_use 8000; then
    echo "🔄 Stopping existing backend server..."
    pkill -f "uvicorn.*8000" || true
fi

if port_in_use 3000; then
    echo "🔄 Stopping existing frontend server..."
    pkill -f "next.*3000" || true
fi

echo "🚀 Starting backend server on http://localhost:8000..."
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ../frontend
echo "🚀 Starting frontend server on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for servers to start
sleep 3

echo ""
echo "🎉 Course Management System is starting up!"
echo ""
echo "📚 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "uvicorn.*8000" 2>/dev/null || true
    pkill -f "next.*3000" 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

trap cleanup SIGINT

# Wait for both processes
wait