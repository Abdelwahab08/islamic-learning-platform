'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Users, 
  Eye, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  Server
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SystemStats {
  activeUsers: number
  totalUsers: number
  onlineTeachers: number
  onlineStudents: number
  systemLoad: number
  memoryUsage: number
  diskUsage: number
  uptime: string
}

interface ActivityLog {
  id: string
  user: string
  action: string
  timestamp: string
  status: 'success' | 'error' | 'warning'
  ip: string
}

export default function AdminLivePage() {
  const [stats, setStats] = useState<SystemStats>({
    activeUsers: 0,
    totalUsers: 0,
    onlineTeachers: 0,
    onlineStudents: 0,
    systemLoad: 0,
    memoryUsage: 0,
    diskUsage: 0,
    uptime: '0:00:00'
  })

  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchLiveData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchLiveData, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchLiveData = async () => {
    try {
      // Simulate API calls
      const mockStats: SystemStats = {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        totalUsers: 150,
        onlineTeachers: Math.floor(Math.random() * 10) + 2,
        onlineStudents: Math.floor(Math.random() * 40) + 8,
        systemLoad: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        uptime: '2:15:30'
      }

      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          user: 'student@islamic.edu',
          action: 'تسجيل الدخول',
          timestamp: new Date().toISOString(),
          status: 'success',
          ip: '192.168.1.100'
        },
        {
          id: '2',
          user: 'teacher@islamic.edu',
          action: 'رفع مادة تعليمية',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          status: 'success',
          ip: '192.168.1.101'
        },
        {
          id: '3',
          user: 'admin@islamic.edu',
          action: 'تعديل إعدادات النظام',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          status: 'warning',
          ip: '192.168.1.102'
        }
      ]

      setStats(mockStats)
      setActivities(mockActivities)
    } catch (error) {
      toast.error('فشل في تحميل البيانات المباشرة')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">نجح</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">خطأ</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">تحذير</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">غير معروف</Badge>
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA')
  }

  const getSystemHealth = () => {
    if (stats.systemLoad > 80 || stats.memoryUsage > 80) {
      return { status: 'error', text: 'حرج', color: 'text-red-600' }
    } else if (stats.systemLoad > 60 || stats.memoryUsage > 60) {
      return { status: 'warning', text: 'متوسط', color: 'text-yellow-600' }
    } else {
      return { status: 'success', text: 'ممتاز', color: 'text-green-600' }
    }
  }

  const systemHealth = getSystemHealth()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">المراقبة المباشرة</h1>
            <p className="text-gray-600">مراقبة النظام والنشاط في الوقت الفعلي</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchLiveData}
              className="btn-secondary"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              className="btn-primary"
            >
              <Activity className="w-4 h-4 ml-2" />
              {autoRefresh ? 'إيقاف التحديث التلقائي' : 'تشغيل التحديث التلقائي'}
            </Button>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المستخدمون النشطون</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
              <span className="text-green-600">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المعلمون المتصلون</p>
                <p className="text-2xl font-bold text-green-600">{stats.onlineTeachers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
              <span className="text-green-600">+5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الطلاب المتصلون</p>
                <p className="text-2xl font-bold text-purple-600">{stats.onlineStudents}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
              <span className="text-green-600">+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">صحة النظام</p>
                <p className={`text-2xl font-bold ${systemHealth.color}`}>
                  {systemHealth.text}
                </p>
              </div>
              <Server className="w-8 h-8 text-gray-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Clock className="w-4 h-4 text-gray-500 ml-1" />
              <span className="text-gray-600">تشغيل: {stats.uptime}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 ml-2" />
              موارد النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>استخدام المعالج</span>
                <span>{stats.systemLoad.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    stats.systemLoad > 80 ? 'bg-red-500' : 
                    stats.systemLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stats.systemLoad}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>استخدام الذاكرة</span>
                <span>{stats.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    stats.memoryUsage > 80 ? 'bg-red-500' : 
                    stats.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stats.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>استخدام القرص</span>
                <span>{stats.diskUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    stats.diskUsage > 80 ? 'bg-red-500' : 
                    stats.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stats.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="w-5 h-5 ml-2" />
              حالة الاتصال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                  <span>قاعدة البيانات</span>
                </div>
                <Badge className="bg-green-100 text-green-800">متصل</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                  <span>خادم الويب</span>
                </div>
                <Badge className="bg-green-100 text-green-800">يعمل</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                  <span>خدمة البريد الإلكتروني</span>
                </div>
                <Badge className="bg-green-100 text-green-800">متصل</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 ml-2" />
                  <span>خدمة النسخ الاحتياطي</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">تحذير</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 ml-2" />
            سجل النشاط المباشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(activity.status)}
                  <div className="mr-4">
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="text-sm text-gray-500">{activity.ip}</span>
                  <span className="text-sm text-gray-500">{formatTime(activity.timestamp)}</span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
