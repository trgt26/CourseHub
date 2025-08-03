'use client'

import { useAuth } from '../../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { useQuery, useQueryClient } from 'react-query'
import { coursesAPI, lessonsAPI } from '../../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Edit, Plus, Play, Users, Clock, Save, Eye, BarChart3 } from 'lucide-react'

export default function InstructorCourseEditPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = parseInt(params.id)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail_url: '',
    is_published: false
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (!authLoading && user && !user.is_instructor) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const { data: courseResponse, isLoading: courseLoading, error: courseError } = useQuery(
    ['course', courseId],
    () => coursesAPI.getCourse(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  const { data: lessonsResponse, isLoading: lessonsLoading } = useQuery(
    ['course-lessons', courseId],
    () => lessonsAPI.getCourseLessons(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  const course = courseResponse?.data
  const lessons = lessonsResponse?.data || []

  // Update form data when course loads
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || 0,
        thumbnail_url: course.thumbnail_url || '',
        is_published: course.is_published || false
      })
    }
  }, [course])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }))
  }

  const handleSave = async () => {
    try {
      await coursesAPI.updateCourse(courseId, formData)
      queryClient.invalidateQueries(['course', courseId])
      queryClient.invalidateQueries('created-courses')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update course:', error)
      alert('Failed to update course. Please try again.')
    }
  }

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

  if (!user || !user.is_instructor) {
    return null
  }

  if (courseLoading) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Loading course...</p>
        </div>
      </MainLayout>
    )
  }

  if (courseError || !course) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Course Not Found</h1>
          <p className="text-xl text-muted-foreground">
            The course you're looking for doesn't exist or you don't have permission to edit it.
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

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/instructor/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {isEditing ? 'Edit Course' : course.title}
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                {isEditing ? 'Update your course information' : 'Manage your course content and settings'}
              </p>
            </div>
            <div className="flex space-x-2">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Button>
              )}
              <Link href={`/courses/${courseId}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Course
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  {isEditing ? 'Update your course details' : 'Course details and settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    {/* Title */}
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Course Title *
                      </label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={4}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">
                        Price (in cents)
                      </label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>

                    {/* Thumbnail URL */}
                    <div className="space-y-2">
                      <label htmlFor="thumbnail_url" className="text-sm font-medium">
                        Thumbnail URL
                      </label>
                      <Input
                        id="thumbnail_url"
                        name="thumbnail_url"
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Published Status */}
                    <div className="flex items-center space-x-2">
                      <input
                        id="is_published"
                        name="is_published"
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={handleCheckboxChange}
                        className="rounded"
                      />
                      <label htmlFor="is_published" className="text-sm font-medium">
                        Publish course
                      </label>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <Button type="submit" className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          // Reset form data to original values
                          if (course) {
                            setFormData({
                              title: course.title || '',
                              description: course.description || '',
                              price: course.price || 0,
                              thumbnail_url: course.thumbnail_url || '',
                              is_published: course.is_published || false
                            })
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Title</h3>
                      <p className="text-muted-foreground">{course.title}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-muted-foreground">{course.description || 'No description'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Price</h3>
                      <p className="text-muted-foreground">
                        {course.price === 0 ? 'Free' : `$${(course.price / 100).toFixed(2)}`}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lessons */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>
                      {lessons.length} lessons • {lessons.reduce((acc: number, lesson: any) => acc + (lesson.duration_minutes || 0), 0)} minutes total
                    </CardDescription>
                  </div>
                  <Link href={`/instructor/courses/${courseId}/lessons/create`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {lessonsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="h-10 w-10 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No lessons yet. Add your first lesson to get started.</p>
                    <Link href={`/instructor/courses/${courseId}/lessons/create`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Lesson
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson: any, index: number) => (
                      <div key={lesson.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{lesson.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {lesson.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration_minutes || 0} min</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/instructor/courses/${courseId}/lessons/${lesson.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </Link>
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
            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Students</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{course.student_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lessons</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{lessons.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(course.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/instructor/courses/${courseId}/analytics`}>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href={`/instructor/courses/${courseId}/students`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Course
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 