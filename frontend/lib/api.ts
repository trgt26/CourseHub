import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  register: (userData: any) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}

export const coursesAPI = {
  getCourses: (params?: any) => api.get('/courses', { params }),
  getCourse: (id: number) => api.get(`/courses/${id}`),
  createCourse: (data: any) => api.post('/courses', data),
  updateCourse: (id: number, data: any) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: number) => api.delete(`/courses/${id}`),
  enrollInCourse: (id: number) => api.post(`/courses/${id}/enroll`),
  getMyEnrolledCourses: () => api.get('/courses/my/enrolled'),
  getMyCreatedCourses: () => api.get('/courses/my/created'),
}

export const lessonsAPI = {
  createLesson: (data: any) => api.post('/lessons', data),
  getLesson: (id: number) => api.get(`/lessons/${id}`),
  updateLesson: (id: number, data: any) => api.put(`/lessons/${id}`, data),
  deleteLesson: (id: number) => api.delete(`/lessons/${id}`),
  markComplete: (id: number) => api.post(`/lessons/${id}/complete`),
  markIncomplete: (id: number) => api.post(`/lessons/${id}/uncomplete`),
  getCourseLessons: (courseId: number) => api.get(`/lessons/course/${courseId}`),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}