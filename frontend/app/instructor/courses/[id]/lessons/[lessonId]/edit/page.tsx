'use client'

import { useAuth } from '../../../../../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../../../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../../components/ui/Card'
import { Button } from '../../../../../../../components/ui/Button'
import { Input } from '../../../../../../../components/ui/Input'
import { useQuery, useQueryClient } from 'react-query'
import { coursesAPI, lessonsAPI } from '../../../../../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Save, Video, FileText, Trash2 } from 'lucide-react'

export default function EditLessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = parseInt(params.id)
  const lessonId = parseInt(params.lessonId)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    order_index: 0,
    is_published: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (!authLoading && user && !user.is_instructor) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Get course details to verify ownership
  const { data: courseResponse } = useQuery(
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

  // Update form data when lesson loads
  useEffect(() => {
    if (lessonResponse?.data) {
      const lesson = lessonResponse.data
      setFormData({
        title: lesson.title || '',
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        order_index: lesson.order_index || 0,
        is_published: lesson.is_published || false
      })
    }
  }, [lessonResponse])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await lessonsAPI.updateLesson(lessonId, formData)
      
      // Invalidate and refetch data
      queryClient.invalidateQueries(['lesson', lessonId])
      queryClient.invalidateQueries(['course', courseId])
      queryClient.invalidateQueries(['course-lessons', courseId])
      queryClient.invalidateQueries('created-courses')
      
      alert('Lesson updated successfully!')
    } catch (error) {
      console.error('Failed to update lesson:', error)
      alert('Failed to update lesson. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await lessonsAPI.deleteLesson(lessonId)
      
      // Invalidate and refetch data
      queryClient.invalidateQueries(['course', courseId])
      queryClient.invalidateQueries(['course-lessons', courseId])
      queryClient.invalidateQueries('created-courses')
      
      // Redirect to course page
      router.push(`/instructor/courses/${courseId}`)
    } catch (error) {
      console.error('Failed to delete lesson:', error)
      alert('Failed to delete lesson. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading || lessonLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
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
            You don't have permission to edit lessons in this course.
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

  if (!lessonResponse?.data) {
    return (
      <MainLayout>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Lesson Not Found</h1>
          <p className="text-xl text-muted-foreground">
            The lesson you're looking for doesn't exist.
          </p>
          <Link href={`/instructor/courses/${courseId}`}>
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
          <Link href={`/instructor/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Edit Lesson</h1>
              <p className="text-xl text-muted-foreground mt-2">
                {courseResponse?.data?.title && `Editing lesson in "${courseResponse.data.title}"`}
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Lesson'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Information</CardTitle>
            <CardDescription>
              Update the lesson details below. Changes will be saved immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Lesson Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter lesson title"
                  required
                />
              </div>

              {/* Order Index */}
              <div className="space-y-2">
                <label htmlFor="order_index" className="text-sm font-medium">
                  Lesson Order
                </label>
                <Input
                  id="order_index"
                  name="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="1"
                />
                <p className="text-sm text-muted-foreground">
                  The order in which this lesson appears in the course. Lower numbers appear first.
                </p>
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <label htmlFor="video_url" className="text-sm font-medium">
                  Video URL
                </label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="video_url"
                    name="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/video.mp4"
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Optional: Add a URL to a video for this lesson (YouTube, Vimeo, or direct video file)
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Lesson Content
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write the lesson content here. You can use markdown formatting."
                    className="w-full min-h-[200px] px-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={8}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Optional: Add detailed content, notes, or instructions for this lesson. You can use markdown formatting.
                </p>
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
                  Publish lesson
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                If unchecked, the lesson will be saved as a draft and won't be visible to students until published.
              </p>

              {/* Submit Button */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/instructor/courses/${courseId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {formData.content && (
          <Card>
            <CardHeader>
              <CardTitle>Content Preview</CardTitle>
              <CardDescription>
                How your lesson content will appear to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
                  {formData.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/courses/${courseId}/lessons/${lessonId}`}>
              <Button variant="outline" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Preview Lesson as Student
              </Button>
            </Link>
            <Link href={`/instructor/courses/${courseId}/lessons/create`}>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Add Another Lesson
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 