'use client'

import { useAuth } from '../../../../lib/contexts/AuthContext'
import { MainLayout } from '../../../../components/Layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { useQueryClient } from 'react-query'
import { coursesAPI } from '../../../../lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Save, Upload } from 'lucide-react'

export default function CreateCoursePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail_url: '',
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
      const response = await coursesAPI.createCourse(formData)
      const courseId = response.data.id
      
      // Invalidate and refetch courses
      queryClient.invalidateQueries('courses')
      queryClient.invalidateQueries('created-courses')
      
      // Redirect to the new course
      router.push(`/instructor/courses/${courseId}`)
    } catch (error) {
      console.error('Failed to create course:', error)
      alert('Failed to create course. Please try again.')
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
          
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Create New Course</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Share your knowledge and create an amazing learning experience
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Fill in the details below to create your course. You can add lessons after creating the course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter course title"
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
                  placeholder="Describe what students will learn in this course"
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
                  placeholder="0 for free, 1000 for $10.00"
                  min="0"
                />
                <p className="text-sm text-muted-foreground">
                  Enter price in cents (e.g., 1000 = $10.00). Set to 0 for free courses.
                </p>
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
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Add a URL to a course thumbnail image
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
                  Publish course immediately
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                If unchecked, the course will be created as a draft and won't be visible to students until published.
              </p>

              {/* Submit Button */}
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
                <Link href="/instructor/courses">
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
            <CardTitle className="text-blue-900">Tips for Creating Great Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Write a clear, compelling title that describes what students will learn</li>
              <li>• Provide a detailed description that outlines the course content and benefits</li>
              <li>• Consider starting with a free course to build your reputation</li>
              <li>• You can add lessons and edit the course after creation</li>
              <li>• Use high-quality images for your course thumbnail</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
} 