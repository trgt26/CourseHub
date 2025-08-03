'use client'

import { useAuth } from '../../../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/Card'
import { Button } from '../../../../../components/ui/Button'
import { useQuery, useQueryClient } from 'react-query'
import { coursesAPI, lessonsAPI } from '../../../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Play, CheckCircle, Clock, BookOpen, Video } from 'lucide-react'

export default function LessonViewPage({ params }: { params: { id: string; lessonId: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = parseInt(params.id)
  const lessonId = parseInt(params.lessonId)
  
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
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

  // Get lesson details
  const { data: lessonResponse, isLoading: lessonLoading } = useQuery(
    ['lesson', lessonId],
    () => lessonsAPI.getLesson(lessonId),
    {
      enabled: !!user && !isNaN(lessonId),
    }
  )

  // Get all course lessons for navigation
  const { data: lessonsResponse, isLoading: lessonsLoading } = useQuery(
    ['course-lessons', courseId],
    () => lessonsAPI.getCourseLessons(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  // Check if user is enrolled
  const { data: enrolledCoursesResponse } = useQuery(
    'enrolled-courses',
    coursesAPI.getMyEnrolledCourses,
    {
      enabled: !!user && !user.is_instructor,
    }
  )

  const course = courseResponse?.data
  const lesson = lessonResponse?.data
  const lessons = lessonsResponse?.data || []
  const enrolledCourses = enrolledCoursesResponse?.data || []

  // Check if user is enrolled in this course
  const isEnrolled = enrolledCourses.some((enrolledCourse: any) => enrolledCourse.id === courseId)

  // Find current lesson index and get next/previous lessons
  const currentLessonIndex = lessons.findIndex((l: any) => l.id === lessonId)
  const currentLesson = lessons[currentLessonIndex]
  const nextLesson = lessons[currentLessonIndex + 1]
  const previousLesson = lessons[currentLessonIndex - 1]

  const handleMarkComplete = async () => {
    if (!lesson) return
    
    setIsMarkingComplete(true)
    try {
      if (lesson.is_completed) {
        await lessonsAPI.markIncomplete(lessonId)
      } else {
        await lessonsAPI.markComplete(lessonId)
      }
      
      // Invalidate and refetch data
      queryClient.invalidateQueries(['lesson', lessonId])
      queryClient.invalidateQueries(['course-lessons', courseId])
      queryClient.invalidateQueries('enrolled-courses')
      
    } catch (error) {
      console.error('Failed to update lesson status:', error)
      alert('Failed to update lesson status. Please try again.')
    } finally {
      setIsMarkingComplete(false)
    }
  }

  if (authLoading || courseLoading || lessonLoading) {
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
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
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

  if (!course || !lesson) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Lesson Not Found</h1>
          <p className="text-xl text-muted-foreground">
            The lesson you're looking for doesn't exist or you don't have access to it.
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

  // Check if user has access to this lesson
  if (!user.is_instructor && !isEnrolled) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-xl text-muted-foreground">
            You need to enroll in this course to access its lessons.
          </p>
          <Link href={`/courses/${courseId}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{lesson.title}</h1>
            <p className="text-xl text-muted-foreground mt-2">
              {course.title} • Lesson {currentLessonIndex + 1} of {lessons.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Content Section */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
                <CardDescription>
                  {lesson.duration_minutes ? `${lesson.duration_minutes} minutes` : 'No duration specified'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Player */}
                {lesson.video_url && (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Video Content</p>
                      <p className="text-xs text-gray-500 mt-1">{lesson.video_url}</p>
                      <Button className="mt-4" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lesson Content */}
                {lesson.content && (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">
                        {lesson.content}
                      </pre>
                    </div>
                  </div>
                )}

                {!lesson.video_url && !lesson.content && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No content available for this lesson yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              {previousLesson ? (
                <Link href={`/courses/${courseId}/lessons/${previousLesson.id}`}>
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                  <Button>
                    Next Lesson
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <div className="flex items-center space-x-2">
                    {lesson.is_completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">In Progress</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete}
                  variant={lesson.is_completed ? "outline" : "default"}
                  className="w-full"
                >
                  {isMarkingComplete ? (
                    'Updating...'
                  ) : lesson.is_completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {lessons.filter((l: any) => l.is_completed).length} of {lessons.length} lessons
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${lessons.length > 0 ? (lessons.filter((l: any) => l.is_completed).length / lessons.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(lessons.length > 0 ? (lessons.filter((l: any) => l.is_completed).length / lessons.length) * 100 : 0)}% Complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((l: any, index: number) => (
                    <Link 
                      key={l.id} 
                      href={`/courses/${courseId}/lessons/${l.id}`}
                      className={`block p-3 rounded-lg border transition-colors ${
                        l.id === lessonId 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{index + 1}.</span>
                          <span className="text-sm truncate">{l.title}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {l.is_completed && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          {l.duration_minutes && (
                            <span className="text-xs text-muted-foreground">
                              {l.duration_minutes}m
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 