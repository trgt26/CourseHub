'use client'

import Link from 'next/link'
import { useAuth } from '../../lib/contexts/AuthContext'
import { Button } from '../ui/Button'
import { BookOpen, User, LogOut, Plus, Home } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">CourseHub</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <Link href="/dashboard" className="flex items-center space-x-1 text-sm font-medium hover:text-primary">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/courses" className="text-sm font-medium hover:text-primary">
                  Courses
                </Link>
                {user.is_instructor && (
                  <>
                    <Link href="/instructor/courses" className="text-sm font-medium hover:text-primary">
                      My Courses
                    </Link>
                    <Link href="/instructor/courses/create" className="flex items-center space-x-1 text-sm font-medium hover:text-primary">
                      <Plus className="h-4 w-4" />
                      <span>Create Course</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.full_name}</span>
                  {user.is_instructor && (
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                      Instructor
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}