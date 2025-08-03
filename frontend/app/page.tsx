'use client'

import { useAuth } from '../lib/contexts/AuthContext'
import { MainLayout } from '../components/Layout/MainLayout'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Link from 'next/link'
import { BookOpen, Users, Award, Play } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <MainLayout>
      {user ? (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {user.full_name}!
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Ready to continue your learning journey?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard">
              <Card className="card-hover cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Dashboard</span>
                  </CardTitle>
                  <CardDescription>
                    View your learning progress and statistics
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/courses">
              <Card className="card-hover cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5" />
                    <span>Browse Courses</span>
                  </CardTitle>
                  <CardDescription>
                    Discover new courses and continue learning
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {user.is_instructor && (
              <Link href="/instructor/courses">
                <Card className="card-hover cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>My Courses</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your courses and students
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-8">
          <div className="gradient-bg text-white p-12 rounded-2xl">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to CourseHub
            </h1>
            <p className="text-xl mb-8 opacity-90">
              The ultimate platform for online learning and teaching
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Learn at Your Pace</CardTitle>
                <CardDescription>
                  Access courses anytime, anywhere. Learn at your own speed with interactive content.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expert Instructors</CardTitle>
                <CardDescription>
                  Learn from industry experts and experienced instructors who are passionate about teaching.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning progress with detailed analytics and completion tracking.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}
    </MainLayout>
  )
}