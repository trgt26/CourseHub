'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../api'
import Cookies from 'js-cookie'
import { useQueryClient } from 'react-query'

interface User {
  id: number
  email: string
  username: string
  full_name: string
  is_instructor: boolean
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  register: (userData: {
    email: string
    username: string
    full_name: string
    password: string
    is_instructor: boolean
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = Cookies.get('access_token')
    if (token) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      Cookies.remove('access_token')
      setUser(null) // Clear user state on error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const { access_token } = response.data
    Cookies.set('access_token', access_token, { expires: 7 })
    
    // Clear any existing cache before fetching new user data
    queryClient.clear()
    setUser(null) // Clear any existing user data
    
    await fetchUser()
  }

  const register = async (userData: {
    email: string
    username: string
    full_name: string
    password: string
    is_instructor: boolean
  }) => {
    await api.post('/auth/register', userData)
  }

  const logout = () => {
    Cookies.remove('access_token')
    setUser(null)
    // Clear all React Query cache
    queryClient.clear()
    // Clear any cached data by reloading the page
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}