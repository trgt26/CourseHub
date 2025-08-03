'use client'

import { useAuth } from '../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useQuery } from 'react-query'
import { coursesAPI } from '../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { BookOpen, Users, Clock, Plus, Edit, Eye, BarChart3 } from 'lucide-react'

export default function InstructorCoursesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (!authLoading && user && !user.is_instructor) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const { data: coursesResponse, isLoading, error } = useQuery(
    'created-courses',
    coursesAPI.getMyCreatedCourses,
    {
      enabled: !!user && user.is_instructor,
    }
  )

  const courses = coursesResponse?.data || []

  if (authLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
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

  if (error) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">My Courses</h1>
          <p className="text-xl text-muted-foreground">
            Error loading courses. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Courses</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Manage your courses and track student progress
            </p>
          </div>
          <Link href="/instructor/courses/create">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating your first course to share your knowledge with students.
              </p>
              <Link href="/instructor/courses/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Card key={course.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {course.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.student_count || 0} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(course.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link href={`/instructor/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/instructor/courses/${course.id}/analytics`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Stats
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {courses.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{courses.length}</div>
                  <div className="text-sm text-muted-foreground">Total Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {courses.filter((c: any) => c.is_published).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {courses.filter((c: any) => !c.is_published).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Drafts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {courses.reduce((acc: number, c: any) => acc + (c.student_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
} 