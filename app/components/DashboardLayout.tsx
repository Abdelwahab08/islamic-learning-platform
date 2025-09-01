'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Bell, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { clearAuthCookie } from '@/lib/auth-client'
import toast from 'react-hot-toast'
import NotificationDropdown from './NotificationDropdown'

interface User {
  id: string
  role: string
  email: string
}

interface Notification {
  id: string
  title: string
  body: string
  read_flag: boolean
  created_at: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: User
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(user || null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!currentUser) {
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          })
          if (response.ok) {
            const userData = await response.json()
            setCurrentUser(userData)
          }
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      }
      fetchUser()
    }
  }, [currentUser])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    if (currentUser) {
      fetchNotifications()
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read_flag: true } : n
      )
    )
  }

  const handleLogout = async () => {
    try {
      await clearAuthCookie()
      toast.success('تم تسجيل الخروج بنجاح')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('حدث خطأ في تسجيل الخروج')
    }
  }

  const getNavItems = () => {
    if (!currentUser) return []

    switch (currentUser.role) {
      case 'STUDENT':
        return [
          { href: '/dashboard/student', label: 'نظرة عامة', icon: <Home className="w-5 h-5" /> },
          { href: '/dashboard/student/assignments', label: 'الواجبات', icon: <FileText className="w-5 h-5" /> },
          { href: '/dashboard/student/certificates', label: 'الشهادات', icon: <GraduationCap className="w-5 h-5" /> },
          { href: '/dashboard/student/meetings', label: 'الاجتماعات', icon: <Calendar className="w-5 h-5" /> },
          { href: '/dashboard/student/materials', label: 'المواد التعليمية', icon: <BookOpen className="w-5 h-5" /> },
          { href: '/dashboard/student/schedule', label: 'الجدول الزمني', icon: <Calendar className="w-5 h-5" /> },
          { href: '/dashboard/student/complaints', label: 'الشكاوى', icon: <MessageSquare className="w-5 h-5" /> },
          { href: '/quran', label: 'القرآن الكريم', icon: <BookOpen className="w-5 h-5" /> },
        ]
      case 'TEACHER':
        return [
          { href: '/dashboard/teacher', label: 'نظرة عامة', icon: <Home className="w-5 h-5" /> },
          { href: '/dashboard/teacher/students', label: 'عرض الطلاب', icon: <Users className="w-5 h-5" /> },
          { href: '/dashboard/teacher/students/timetable', label: 'جدول المتابعة الأسبوعي', icon: <Calendar className="w-5 h-5" /> },
          { href: '/dashboard/teacher/assignments', label: 'الواجبات', icon: <FileText className="w-5 h-5" /> },
          { href: '/dashboard/teacher/certificates', label: 'الشهادات', icon: <GraduationCap className="w-5 h-5" /> },
          { href: '/dashboard/teacher/meetings', label: 'الاجتماعات', icon: <Calendar className="w-5 h-5" /> },
          { href: '/dashboard/teacher/materials', label: 'المواد التعليمية', icon: <BookOpen className="w-5 h-5" /> },
          { href: '/dashboard/teacher/schedule', label: 'الجدول الزمني', icon: <Calendar className="w-5 h-5" /> },
          { href: '/dashboard/teacher/groups', label: 'المجموعات', icon: <Users className="w-5 h-5" /> },
          { href: '/dashboard/teacher/complaints', label: 'الشكاوى', icon: <MessageSquare className="w-5 h-5" /> },
          { href: '/dashboard/teacher/chat', label: 'الشات', icon: <MessageSquare className="w-5 h-5" /> },
          { href: '/quran', label: 'القرآن الكريم', icon: <BookOpen className="w-5 h-5" /> },
        ]
      case 'ADMIN':
        return [
          { href: '/dashboard/admin', label: 'نظرة عامة', icon: <Home className="w-5 h-5" /> },
          { href: '/dashboard/admin/users', label: 'المستخدمون والموافقات', icon: <Users className="w-5 h-5" /> },
          { href: '/dashboard/admin/certificates', label: 'الشهادات والقوالب', icon: <GraduationCap className="w-5 h-5" /> },
          { href: '/dashboard/admin/content', label: 'المحتوى والإشعارات', icon: <FileText className="w-5 h-5" /> },
          { href: '/dashboard/admin/reports', label: 'التقارير العامة', icon: <FileText className="w-5 h-5" /> },

          { href: '/dashboard/admin/settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
          { href: '/dashboard/admin/complaints', label: 'الشكاوى', icon: <MessageSquare className="w-5 h-5" /> },
          { href: '/dashboard/admin/live', label: 'لوحة مباشرة', icon: <Home className="w-5 h-5" /> },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
                           <div className="flex items-center">
                 <img 
                   src="/logo.jpg" 
                   alt="منصة التعلم الإسلامي" 
                   className="w-8 h-8 rounded-full mr-3"
                 />
                              <h1 className="text-xl font-bold text-primary">منصه يقين</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-6 border-b">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {currentUser?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
                             <div className="ml-3">
                <p className="font-medium text-gray-900">{currentUser?.email}</p>
                <p className="text-sm text-muted">
                  {currentUser?.role === 'STUDENT' && 'طالب'}
                  {currentUser?.role === 'TEACHER' && 'معلم'}
                  {currentUser?.role === 'ADMIN' && 'مدير'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                                 <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
                             <span className="ml-3">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
                             <div className="hidden lg:flex items-center mr-4">
                <img 
                  src="/logo.jpg" 
                  alt="منصة التعلم الإسلامي" 
                  className="w-8 h-8 rounded-full shadow-sm"
                />
                                 <span className="text-lg font-bold text-primary ml-2">منصه يقين لتعليم القرآن الكريم</span>
              </div>
            </div>

                                                  <div className="flex items-center space-x-4">
               {/* Notifications */}
               <div className="relative">
                 <button 
                   onClick={() => setShowNotifications(!showNotifications)}
                   className="p-2 text-gray-600 hover:text-primary transition-colors relative"
                 >
                   <Bell className="w-5 h-5" />
                   {notifications.filter(n => !n.read_flag).length > 0 && (
                     <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                       {notifications.filter(n => !n.read_flag).length}
                     </span>
                   )}
                 </button>
                 
                 {showNotifications && (
                   <NotificationDropdown
                     notifications={notifications}
                     onMarkAsRead={handleMarkAsRead}
                     onClose={() => setShowNotifications(false)}
                   />
                 )}
               </div>

              {/* User menu */}
              <div className="flex items-center">
                <span className="text-sm text-muted">
                  مرحباً، {currentUser?.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
