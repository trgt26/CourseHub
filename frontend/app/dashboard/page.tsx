'use client'

import { useAuth } from '../../lib/contexts/AuthContext'
import { MainLayout } from '../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useQuery } from 'react-query'
import { dashboardAPI, coursesAPI } from '../../lib/api'
import Link from 'next/link'
import { BookOpen, Users, Award, TrendingUp, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const { data: stats } = useQuery('dashboard-stats', dashboardAPI.getStats, {
    enabled: !!user,
  })

  const { data: enrolledCourses } = useQuery(
    'enrolled-courses',
    coursesAPI.getMyEnrolledCourses,
    {
      enabled: !!user && !user.is_instructor,
    }
  )

  const { data: createdCourses } = useQuery(
    'created-courses',
    coursesAPI.getMyCreatedCourses,
    {
      enabled: !!user && user.is_instructor,
    }
  )

  if (!user) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to your Dashboard, {user.full_name}!
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            {user.is_instructor 
              ? "Manage your courses and track student progress" 
              : "Track your learning progress and discover new courses"
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.is_instructor ? "Total Courses" : "Available Courses"}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.data.total_courses || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.is_instructor ? "Total Students" : "Enrolled Courses"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.is_instructor 
                  ? (stats?.data.total_students || 0)
                  : (stats?.data.enrolled_courses || 0)
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.data.completed_lessons || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.data.enrolled_courses > 0 
                  ? Math.round((stats?.data.completed_lessons || 0) / (stats?.data.enrolled_courses * 5) * 100)
                  : 0
                }%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {user.is_instructor 
                  ? "Manage your courses and content"
                  : "Continue your learning journey"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.is_instructor ? (
                <>
                  <Link href="/instructor/courses/create">
                    <Button className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Course
                    </Button>
                  </Link>
                  <Link href="/instructor/courses">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage Courses
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/courses">
                    <Button className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Courses
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      My Enrolled Courses
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {user.is_instructor ? "Your Courses" : "Recent Courses"}
              </CardTitle>
              <CardDescription>
                {user.is_instructor 
                  ? "Courses you've created"
                  : "Courses you're currently enrolled in"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.is_instructor ? (
                  createdCourses?.data?.slice(0, 3).map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.student_count} students
                        </p>
                      </div>
                      <Link href={`/instructor/courses/${course.id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  enrolledCourses?.data?.slice(0, 3).map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          By {course.instructor.full_name}
                        </p>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" variant="ghost">Continue</Button>
                      </Link>
                    </div>
                  ))
                )}

                {((user.is_instructor ? createdCourses?.data : enrolledCourses?.data) || []).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    {user.is_instructor 
                      ? "No courses created yet"
                      : "No courses enrolled yet"
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}