'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Award,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportData {
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  pendingApprovals: number
  totalCertificates: number
  pendingCertificates: number
  totalAssignments: number
  completedAssignments: number
  totalMaterials: number
  totalMeetings: number
  totalComplaints: number
  resolvedComplaints: number
  monthlyStats: {
    month: string
    newUsers: number
    newCertificates: number
    newAssignments: number
  }[]
  topTeachers: {
    name: string
    students: number
    certificates: number
  }[]
  stageProgress: {
    stage: string
    students: number
    completionRate: number
  }[]
}

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const [reportType, setReportType] = useState('overview')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/admin/reports?range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        toast.error('فشل في تحميل البيانات')
      }
    } catch (error) {
      toast.error('فشل في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/download?type=${type}&range=${dateRange}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${type}-${dateRange}days.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('تم تحميل التقرير بنجاح')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'فشل في تحميل التقرير')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('فشل في تحميل التقرير')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد بيانات متاحة</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center mb-4">
            <img 
              src="/logo.jpg" 
              alt="منصة التعلم الإسلامي" 
              className="w-12 h-12 rounded-full shadow-md ml-3"
            />
            <div>
                             <h1 className="text-3xl font-bold text-primary mb-2">منصه يقين</h1>
              <p className="text-muted">إحصائيات وتحليلات شاملة للمنصة</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">الفترة الزمنية:</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value="7">آخر 7 أيام</option>
                  <option value="30">آخر 30 يوم</option>
                  <option value="90">آخر 3 أشهر</option>
                  <option value="365">آخر سنة</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={fetchReportData}
                  className="btn-secondary"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تحديث
                </Button>
                <Button
                  onClick={() => downloadReport('comprehensive')}
                  className="btn-primary"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل التقرير
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-blue-600">{reportData.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {reportData.totalTeachers} معلم • {reportData.totalStudents} طالب
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الشهادات</p>
                  <p className="text-2xl font-bold text-green-600">{reportData.totalCertificates}</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {reportData.pendingCertificates} في انتظار الموافقة
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الواجبات</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData.totalAssignments}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {reportData.completedAssignments} مكتملة
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الشكاوى</p>
                  <p className="text-2xl font-bold text-orange-600">{reportData.totalComplaints}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {reportData.resolvedComplaints} محلولة
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 ml-2" />
                الإحصائيات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.monthlyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{stat.month}</p>
                      <p className="text-sm text-gray-600">
                        {stat.newUsers} مستخدم جديد • {stat.newCertificates} شهادة
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {stat.newAssignments} واجب
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Teachers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 ml-2" />
                أفضل المعلمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topTeachers.map((teacher, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-gray-600">
                        {teacher.students} طالب
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {teacher.certificates} شهادة
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stage Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 ml-2" />
              تقدم المراحل الدراسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.stageProgress.map((stage, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{stage.stage}</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {stage.students} طالب
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${stage.completionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    نسبة الإنجاز: {stage.completionRate}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 ml-2" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => downloadReport('users')}
                variant="outline"
                className="btn-outline"
              >
                <Download className="w-4 h-4 ml-2" />
                تقرير المستخدمين
              </Button>
              <Button
                onClick={() => downloadReport('certificates')}
                variant="outline"
                className="btn-outline"
              >
                <Download className="w-4 h-4 ml-2" />
                تقرير الشهادات
              </Button>
              <Button
                onClick={() => downloadReport('performance')}
                variant="outline"
                className="btn-outline"
              >
                <Download className="w-4 h-4 ml-2" />
                تقرير الأداء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
