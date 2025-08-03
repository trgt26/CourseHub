import './globals.css'
import { Inter } from 'next/font/google'
import { QueryClientProvider } from '../lib/providers/QueryClientProvider'
import { AuthProvider } from '../lib/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Course Management System',
  description: 'Online course management platform for instructors and students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}