'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/app/components/DashboardLayout'
import { 
  Users, 
  FileText, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TeacherStats {
  totalStudents: number
  activeStudents: number
  totalAssignments: number
  pendingSubmissions: number
  certificatesIssued: number
  upcomingMeetings: number
  totalGroups: number
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/teacher/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          toast.error('حدث خطأ في تحميل البيانات')
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        toast.error('حدث خطأ في الاتصال')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const dashboardCards = [
    {
      title: 'الطلاب',
      value: stats?.totalStudents || 0,
      subtitle: `${stats?.activeStudents || 0} نشط`,
      icon: <Users className="w-8 h-8" />,
      href: '/dashboard/teacher/students',
      color: 'bg-blue-500',
    },
    {
      title: 'الواجبات',
      value: stats?.totalAssignments || 0,
      subtitle: `${stats?.pendingSubmissions || 0} معلق`,
      icon: <FileText className="w-8 h-8" />,
      href: '/dashboard/teacher/assignments',
      color: 'bg-green-500',
    },
    {
      title: 'الشهادات',
      value: stats?.certificatesIssued || 0,
      subtitle: 'شهادات صادرة',
      icon: <GraduationCap className="w-8 h-8" />,
      href: '/dashboard/teacher/certificates',
      color: 'bg-purple-500',
    },
    {
      title: 'الاجتماعات',
      value: stats?.upcomingMeetings || 0,
      subtitle: 'اجتماعات قادمة',
      icon: <Calendar className="w-8 h-8" />,
      href: '/dashboard/teacher/meetings',
      color: 'bg-orange-500',
    },
  ]

  const quickStats = [
    {
      title: 'المجموعات',
      value: stats?.totalGroups || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'text-primary',
    },
    {
      title: 'الواجبات المعلقة',
      value: stats?.pendingSubmissions || 0,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-yellow-600',
    },
    {
      title: 'الطلاب النشطين',
      value: stats?.activeStudents || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600',
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">لوحة تحكم المعلم</h1>
          <p className="text-muted">إدارة طلابك والواجبات والمواد التعليمية</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid">
          {dashboardCards.map((card, index) => (
            <Link key={index} href={card.href} className="group">
              <div className="card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                    <p className="text-sm text-muted">{card.subtitle}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">إحصائيات سريعة</h2>
            <div className="space-y-4">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`${stat.color} mr-3`}>
                      {stat.icon}
                    </div>
                    <span className="font-medium">{stat.title}</span>
                  </div>
                  <span className="font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">إجراءات سريعة</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/teacher/students"
                className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="w-5 h-5 ml-3" />
                عرض الطلاب
              </Link>
              <Link
                href="/dashboard/teacher/assignments"
                className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="w-5 h-5 ml-3" />
                إنشاء واجب جديد
              </Link>
              <Link
                href="/dashboard/teacher/meetings"
                className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Calendar className="w-5 h-5 ml-3" />
                جدولة اجتماع
              </Link>
              <Link
                href="/dashboard/teacher/materials"
                className="flex items-center p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <BookOpen className="w-5 h-5 ml-3" />
                إضافة مادة تعليمية
              </Link>
              <Link
                href="/dashboard/teacher/groups"
                className="flex items-center p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Users className="w-5 h-5 ml-3" />
                إدارة المجموعات
              </Link>
              <Link
                href="/dashboard/teacher/chat"
                className="flex items-center p-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <MessageSquare className="w-5 h-5 ml-3" />
                الشات مع الطلاب
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-6">النشاط الأخير</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full ml-3"></div>
              <div>
                <p className="font-medium">تم تسليم واجب جديد من الطالب أحمد</p>
                <p className="text-sm text-muted">منذ ساعة واحدة</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
              <div>
                <p className="font-medium">تم إنشاء واجب جديد للمرحلة الرشيدي</p>
                <p className="text-sm text-muted">منذ 3 ساعات</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full ml-3"></div>
              <div>
                <p className="font-medium">تم جدولة اجتماع جديد للمجموعة أ</p>
                <p className="text-sm text-muted">منذ يوم واحد</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full ml-3"></div>
              <div>
                <p className="font-medium">تم إضافة مادة تعليمية جديدة</p>
                <p className="text-sm text-muted">منذ يومين</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
