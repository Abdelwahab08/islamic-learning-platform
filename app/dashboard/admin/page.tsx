'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/app/components/DashboardLayout'
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Settings, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminStats {
  totalUsers: number
  pendingApprovals: number
  totalTeachers: number
  totalStudents: number
  totalCertificates: number
  pendingCertificates: number
  activeToasts: number
  totalComplaints: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
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
      title: 'المستخدمون',
      value: stats?.totalUsers || 0,
      subtitle: `${stats?.pendingApprovals || 0} في انتظار الموافقة`,
      icon: <Users className="w-8 h-8" />,
      href: '/dashboard/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'المعلمون',
      value: stats?.totalTeachers || 0,
      subtitle: 'معلمون مسجلون',
      icon: <GraduationCap className="w-8 h-8" />,
      href: '/dashboard/admin/users',
      color: 'bg-green-500',
    },
    {
      title: 'الطلاب',
      value: stats?.totalStudents || 0,
      subtitle: 'طلاب مسجلون',
      icon: <Users className="w-8 h-8" />,
      href: '/dashboard/admin/users',
      color: 'bg-purple-500',
    },
    {
      title: 'الشهادات',
      value: stats?.totalCertificates || 0,
      subtitle: `${stats?.pendingCertificates || 0} في انتظار الموافقة`,
      icon: <FileText className="w-8 h-8" />,
      href: '/dashboard/admin/certificates',
      color: 'bg-orange-500',
    },
  ]

  const quickStats = [
    {
      title: 'طلبات الموافقة',
      value: stats?.pendingApprovals || 0,
      icon: <Clock className="w-6 h-6" />,
      color: 'text-yellow-600',
    },
    {
      title: 'الشهادات المعلقة',
      value: stats?.pendingCertificates || 0,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-orange-600',
    },
    {
      title: 'الإشعارات النشطة',
      value: stats?.activeToasts || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600',
    },
    {
      title: 'الشكاوى',
      value: stats?.totalComplaints || 0,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-red-600',
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
          <h1 className="text-3xl font-bold text-primary mb-2">لوحة تحكم المدير</h1>
          <p className="text-muted">إدارة المنصة والمستخدمين والمحتوى</p>
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
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className={`${stat.color} mb-2 flex justify-center`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-muted">{stat.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6">إجراءات سريعة</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/admin/users"
                className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="w-5 h-5 ml-3" />
                مراجعة طلبات الموافقة
              </Link>
              <Link
                href="/dashboard/admin/certificates"
                className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="w-5 h-5 ml-3" />
                مراجعة الشهادات
              </Link>
              <Link
                href="/dashboard/admin/content"
                className="flex items-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Settings className="w-5 h-5 ml-3" />
                إدارة المحتوى التعليمي
              </Link>
              <Link
                href="/dashboard/admin/settings"
                className="flex items-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5 ml-3" />
                إعدادات النظام
              </Link>
              <Link
                href="/dashboard/admin/live"
                className="flex items-center p-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <TrendingUp className="w-5 h-5 ml-3" />
                المراقبة المباشرة
              </Link>
              <Link
                href="/dashboard/admin/reports"
                className="flex items-center p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <TrendingUp className="w-5 h-5 ml-3" />
                عرض التقارير
              </Link>
              <Link
                href="/dashboard/admin/quran"
                className="flex items-center p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <BookOpen className="w-5 h-5 ml-3" />
                إعدادات القرآن
              </Link>
              <Link
                href="/dashboard/admin/complaints"
                className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 ml-3" />
                مراجعة الشكاوى
              </Link>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">حالة النظام</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">قاعدة البيانات</span>
                <span className="badge badge-success">متصل</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">الخادم</span>
                <span className="badge badge-success">يعمل</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">النسخ الاحتياطية</span>
                <span className="badge badge-success">محدث</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">النشاط اليومي</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">تسجيلات دخول</span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">واجبات جديدة</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">شهادات صادرة</span>
                <span className="font-bold">3</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">التحديثات</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">إصدار جديد متاح</p>
                <p className="text-muted">v2.1.0 - تحسينات في الأداء</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">صيانة مجدولة</p>
                <p className="text-muted">غداً 2:00 صباحاً</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
