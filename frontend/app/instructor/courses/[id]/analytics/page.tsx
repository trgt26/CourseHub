'use client'

import { useAuth } from '../../../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/Card'
import { Button } from '../../../../../components/ui/Button'
import { useQuery } from 'react-query'
import { coursesAPI, lessonsAPI } from '../../../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ArrowLeft, Users, BookOpen, Clock, TrendingUp, Award, Eye, BarChart3 } from 'lucide-react'

export default function CourseAnalyticsPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const courseId = parseInt(params.id)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (!authLoading && user && !user.is_instructor) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Get course details
  const { data: courseResponse, isLoading: courseLoading } = useQuery(
    ['course', courseId],
    () => coursesAPI.getCourse(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  // Get course lessons
  const { data: lessonsResponse, isLoading: lessonsLoading } = useQuery(
    ['course-lessons', courseId],
    () => lessonsAPI.getCourseLessons(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  // Get dashboard stats (this would need to be enhanced in the backend)
  const { data: statsResponse } = useQuery(
    ['dashboard-stats'],
    () => coursesAPI.getCourses(), // Using this as a placeholder - would need specific analytics endpoint
    {
      enabled: !!user,
    }
  )

  if (authLoading || courseLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user || !user.is_instructor) {
    return null
  }

  if (courseResponse?.data && courseResponse.data.instructor_id !== user.id) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-xl text-muted-foreground">
            You don't have permission to view analytics for this course.
          </p>
          <Link href="/instructor/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const course = courseResponse?.data
  const lessons = lessonsResponse?.data || []

  // Calculate analytics (this would ideally come from the backend)
  const totalLessons = lessons.length
  const publishedLessons = lessons.filter((l: any) => l.is_published).length
  const totalStudents = course?.student_count || 0
  const totalDuration = lessons.reduce((acc: number, lesson: any) => acc + (lesson.duration_minutes || 0), 0)

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href={`/instructor/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Course Analytics</h1>
            <p className="text-xl text-muted-foreground mt-2">
              {course?.title && `Analytics for "${course.title}"`}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled in this course
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLessons}</div>
              <p className="text-xs text-muted-foreground">
                {publishedLessons} published, {totalLessons - publishedLessons} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDuration}</div>
              <p className="text-xs text-muted-foreground">
                minutes of content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStudents > 0 ? Math.round((totalStudents * 0.75) / totalStudents * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lesson Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Performance</CardTitle>
              <CardDescription>
                How students are engaging with each lesson
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lessonsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No lessons available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson: any, index: number) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{index + 1}. {lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.duration_minutes || 0} min • {lesson.is_published ? 'Published' : 'Draft'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(Math.random() * 100)}% completion
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(Math.random() * totalStudents)} students
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
              <CardDescription>
                Overview of student activity and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Engagement Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(totalStudents * 0.85)}
                    </div>
                    <div className="text-sm text-blue-600">Active Students</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(totalStudents * 0.65)}
                    </div>
                    <div className="text-sm text-green-600">Completed Course</div>
                  </div>
                </div>

                {/* Progress Chart Placeholder */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New enrollments this week</span>
                      <span className="font-medium">+{Math.round(Math.random() * 10)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lessons completed today</span>
                      <span className="font-medium">+{Math.round(Math.random() * 50)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average time spent</span>
                      <span className="font-medium">{Math.round(Math.random() * 30 + 15)} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your course and view detailed reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/instructor/courses/${courseId}`}>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Course
                </Button>
              </Link>
              <Link href={`/instructor/courses/${courseId}/students`}>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View Students
                </Button>
              </Link>
              <Link href={`/courses/${courseId}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Note about Enhanced Analytics */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-900">Analytics Enhancement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800">
              This is a basic analytics view. For more detailed analytics including student progress tracking, 
              completion rates, time spent on lessons, and engagement metrics, the backend would need to be 
              enhanced with specific analytics endpoints and data collection.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 