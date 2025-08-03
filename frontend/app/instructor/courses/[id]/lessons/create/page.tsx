'use client'

import { useAuth } from '../../../../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/Card'
import { Button } from '../../../../../../components/ui/Button'
import { Input } from '../../../../../../components/ui/Input'
import { useQuery, useQueryClient } from 'react-query'
import { coursesAPI, lessonsAPI } from '../../../../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Save, Video, FileText } from 'lucide-react'

export default function CreateLessonPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = parseInt(params.id)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    order_index: 0,
    is_published: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Get existing lessons to determine next order_index
  const { data: lessonsResponse } = useQuery(
    ['course-lessons', courseId],
    () => lessonsAPI.getCourseLessons(courseId),
    {
      enabled: !!user && !isNaN(courseId),
    }
  )

  // Set default order_index to next available number
  useEffect(() => {
    if (lessonsResponse?.data) {
      const maxOrder = Math.max(...lessonsResponse.data.map((l: any) => l.order_index || 0), 0)
      setFormData(prev => ({
        ...prev,
        order_index: maxOrder + 1
      }))
    }
  }, [lessonsResponse])

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
      const lessonData = {
        ...formData,
        course_id: courseId
      }
      
      const response = await lessonsAPI.createLesson(lessonData)
      const lessonId = response.data.id
      
      // Invalidate and refetch data
      queryClient.invalidateQueries(['course', courseId])
      queryClient.invalidateQueries(['course-lessons', courseId])
      queryClient.invalidateQueries('created-courses')
      
      // Redirect to the lesson edit page
      router.push(`/instructor/courses/${courseId}/lessons/${lessonId}/edit`)
    } catch (error) {
      console.error('Failed to create lesson:', error)
      alert('Failed to create lesson. Please try again.')
    } finally {
      setIsSubmitting(false)
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
            You don't have permission to add lessons to this course.
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
          <Link href={`/instructor/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Add New Lesson</h1>
            <p className="text-xl text-muted-foreground mt-2">
              {courseResponse?.data?.title && `Add a lesson to "${courseResponse.data.title}"`}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Information</CardTitle>
            <CardDescription>
              Fill in the details below to create a new lesson for your course.
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
                  Publish lesson immediately
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                If unchecked, the lesson will be created as a draft and won't be visible to students until published.
              </p>

              {/* Submit Button */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Lesson'}
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

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Tips for Creating Great Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Write clear, descriptive titles that tell students what they'll learn</li>
              <li>• Use the order field to organize lessons logically (1, 2, 3, etc.)</li>
              <li>• Include both video content and written content for better learning</li>
              <li>• Use markdown formatting in content for better readability</li>
              <li>• Consider creating lessons as drafts first, then publishing when ready</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 