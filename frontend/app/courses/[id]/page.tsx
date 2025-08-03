'use client'

import { useAuth } from '../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useQuery } from 'react-query'
import { coursesAPI, lessonsAPI } from '../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BookOpen, Users, Clock, Star, Play, CheckCircle, Lock, ArrowLeft } from 'lucide-react'

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const courseId = parseInt(params.id)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const { data: course, isLoading: courseLoading } = useQuery(
    ['course', courseId],
    () => coursesAPI.getCourse(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  const { data: lessons, isLoading: lessonsLoading } = useQuery(
    ['course-lessons', courseId],
    () => lessonsAPI.getCourseLessons(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  const { data: enrolledCourses } = useQuery(
    'enrolled-courses',
    coursesAPI.getMyEnrolledCourses,
    {
      enabled: !!user && !user.is_instructor,
    }
  )

  useEffect(() => {
    if (enrolledCourses?.data && course?.data) {
      const enrolled = enrolledCourses.data.some((enrolledCourse: any) => 
        enrolledCourse.id === course.data.id
      )
      setIsEnrolled(enrolled)
    }
  }, [enrolledCourses, course])

  if (authLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return null
  }

  if (courseLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!course?.data) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Course Not Found</h1>
          <p className="text-xl text-muted-foreground">
            The course you're looking for doesn't exist.
          </p>
          <Link href="/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const courseData = course.data
  const lessonsData = lessons?.data || []

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{courseData.title}</h1>
            <p className="text-xl text-muted-foreground mt-2">
              {courseData.description || 'No description available'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{lessonsData.length}</div>
                    <div className="text-sm text-muted-foreground">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{courseData.student_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.5</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {courseData.price === 0 ? 'Free' : `$${(courseData.price / 100).toFixed(2)}`}
                    </div>
                    <div className="text-sm text-muted-foreground">Price</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {lessonsData.length} lessons • {lessonsData.reduce((acc: number, lesson: any) => acc + (lesson.duration_minutes || 0), 0)} minutes total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lessonsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="h-10 w-10 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : lessonsData.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No lessons available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessonsData.map((lesson: any, index: number) => (
                      <div key={lesson.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {isEnrolled || user.is_instructor ? (
                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {index + 1}. {lesson.title}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {lesson.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration_minutes || 0} min</span>
                          {lesson.is_completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {courseData.price === 0 ? 'Free' : `$${(courseData.price / 100).toFixed(2)}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {courseData.price === 0 ? 'No cost to enroll' : 'One-time payment'}
                    </div>
                  </div>

                  {user.is_instructor && courseData.instructor_id === user.id ? (
                    <div className="space-y-2">
                      <Link href={`/instructor/courses/${courseId}`}>
                        <Button className="w-full" variant="outline">
                          Edit Course
                        </Button>
                      </Link>
                      <Link href={`/instructor/courses/${courseId}/students`}>
                        <Button className="w-full" variant="outline">
                          Manage Students
                        </Button>
                      </Link>
                    </div>
                  ) : isEnrolled ? (
                    <div className="space-y-2">
                      <Button className="w-full" disabled>
                        Already Enrolled
                      </Button>
                      <Link href={`/courses/${courseId}/lessons/${lessonsData[0]?.id}`}>
                        <Button className="w-full">
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(courseId)}
                    >
                      Enroll Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{courseData.instructor?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {courseData.instructor?.username || 'Instructor'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )

  async function handleEnroll(courseId: number) {
    try {
      await coursesAPI.enrollInCourse(courseId)
      setIsEnrolled(true)
      // Refresh the enrolled courses data
      window.location.reload()
    } catch (error) {
      console.error('Failed to enroll in course:', error)
      alert('Failed to enroll in course. Please try again.')
    }
  }
}