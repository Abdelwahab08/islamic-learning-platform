'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/app/components/DashboardLayout'
import { 
  FileText, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StudentStats {
  totalAssignments: number
  completedAssignments: number
  pendingAssignments: number
  certificates: number
  currentStage: string
  currentPage: number
  totalPages: number
  upcomingMeetings: number
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/student/stats')
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
      title: 'الواجبات',
      value: stats?.totalAssignments || 0,
      subtitle: `${stats?.completedAssignments || 0} مكتملة`,
      icon: <FileText className="w-8 h-8" />,
      href: '/dashboard/student/assignments',
      color: 'bg-blue-500',
    },
    {
      title: 'الشهادات',
      value: stats?.certificates || 0,
      subtitle: 'شهادات معتمدة',
      icon: <GraduationCap className="w-8 h-8" />,
      href: '/dashboard/student/certificates',
      color: 'bg-green-500',
    },
    {
      title: 'الاجتماعات',
      value: stats?.upcomingMeetings || 0,
      subtitle: 'اجتماعات قادمة',
      icon: <Calendar className="w-8 h-8" />,
      href: '/dashboard/student/meetings',
      color: 'bg-purple-500',
    },
    {
      title: 'المواد التعليمية',
      value: 'متاحة',
      subtitle: 'مواد تعليمية',
      icon: <BookOpen className="w-8 h-8" />,
      href: '/dashboard/student/materials',
      color: 'bg-orange-500',
    },
  ]

  const progressCards = [
    {
      title: 'المرحلة الحالية',
      value: stats?.currentStage || 'غير محدد',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-primary',
    },
    {
      title: 'الصفحة الحالية',
      value: `${stats?.currentPage || 0} / ${stats?.totalPages || 0}`,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-accent',
    },
    {
      title: 'الواجبات المعلقة',
      value: stats?.pendingAssignments || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-yellow-600',
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
          <h1 className="text-3xl font-bold text-primary mb-2">مرحباً بك في لوحة التحكم</h1>
          <p className="text-muted">تابع تقدمك التعليمي وإنجازاتك</p>
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

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Progress */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">التقدم الحالي</h2>
            <div className="space-y-4">
              {progressCards.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`${card.color} mr-3`}>
                      {card.icon}
                    </div>
                    <span className="font-medium">{card.title}</span>
                  </div>
                  <span className="font-bold text-gray-900">{card.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">إجراءات سريعة</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/student/assignments"
                className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5 ml-3" />
                عرض الواجبات الجديدة
              </Link>
              <Link
                href="/dashboard/student/meetings"
                className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Calendar className="w-5 h-5 ml-3" />
                الانضمام للاجتماعات
              </Link>
              <Link
                href="/quran"
                className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BookOpen className="w-5 h-5 ml-3" />
                القرآن الكريم
              </Link>
              <Link
                href="/dashboard/student/complaints"
                className="flex items-center p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Users className="w-5 h-5 ml-3" />
                تقديم شكوى
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
                <p className="font-medium">تم إكمال واجب جديد</p>
                <p className="text-sm text-muted">منذ ساعتين</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
              <div>
                <p className="font-medium">تم إضافة مادة تعليمية جديدة</p>
                <p className="text-sm text-muted">منذ يوم واحد</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full ml-3"></div>
              <div>
                <p className="font-medium">تم جدولة اجتماع جديد</p>
                <p className="text-sm text-muted">منذ يومين</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
