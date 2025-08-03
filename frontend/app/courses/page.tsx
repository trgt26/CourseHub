'use client'

import { useAuth } from '../../lib/contexts/AuthContext'
import { MainLayout } from '../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useQuery, useQueryClient } from 'react-query'
import { coursesAPI } from '../../lib/api'
import Link from 'next/link'
import { BookOpen, Users, Clock, Star, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CoursesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPublished, setFilterPublished] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const { data: coursesResponse, isLoading, error } = useQuery(
    'courses',
    () => coursesAPI.getCourses({ published: filterPublished }),
    {
      enabled: !!user,
    }
  )

  // Get enrolled courses for students
  const { data: enrolledCoursesResponse } = useQuery(
    'enrolled-courses',
    coursesAPI.getMyEnrolledCourses,
    {
      enabled: !!user && !user.is_instructor,
    }
  )

  const courses = coursesResponse?.data || []
  const enrolledCourses = enrolledCoursesResponse?.data || []

  // Check if a course is enrolled
  const isEnrolledInCourse = (courseId: number) => {
    return enrolledCourses.some((enrolledCourse: any) => enrolledCourse.id === courseId)
  }

  // Filter courses based on search term
  const filteredCourses = courses.filter((course: any) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Browse Courses</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Loading...
            </p>
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

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Browse Courses</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Discover amazing courses to enhance your skills
            </p>
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

  if (error) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Browse Courses</h1>
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
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Browse Courses</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Discover amazing courses to enhance your skills
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterPublished}
                onChange={(e) => setFilterPublished(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Published only</span>
            </label>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center space-y-4">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-medium">No courses found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No courses are available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => (
              <Card key={course.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {course.description || 'No description available'}
                      </CardDescription>
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
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">4.5</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {!user.is_instructor && (
                      isEnrolledInCourse(course.id) ? (
                        <Button 
                          className="flex-1"
                          disabled
                        >
                          Already Enrolled
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1"
                          onClick={() => handleEnroll(course.id)}
                        >
                          Enroll
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructor CTA */}
        {user.is_instructor && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Create Your Own Course</h3>
                <p className="text-muted-foreground">
                  Share your knowledge and start teaching on our platform
                </p>
                <Link href="/instructor/courses">
                  <Button size="lg">
                    Manage Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )

  async function handleEnroll(courseId: number) {
    try {
      await coursesAPI.enrollInCourse(courseId)
      // Invalidate and refetch enrolled courses data
      queryClient.invalidateQueries('enrolled-courses')
      queryClient.invalidateQueries('courses')
    } catch (error) {
      console.error('Failed to enroll in course:', error)
      alert('Failed to enroll in course. Please try again.')
    }
  }
} 