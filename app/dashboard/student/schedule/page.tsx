'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Calendar, Clock, BookOpen, Users, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScheduleItem {
  id: string
  title: string
  type: 'CLASS' | 'ASSIGNMENT' | 'MEETING' | 'EXAM'
  date: string
  time: string
  duration: number
  teacher_name: string
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'OVERDUE'
  description?: string
  location?: string
  meeting_url?: string
}

export default function StudentSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    fetchSchedule()
  }, [selectedDate])

  const fetchSchedule = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/student/schedule?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setSchedule(data)
      } else {
        toast.error('فشل في تحميل الجدول الزمني')
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      toast.error('حدث خطأ في تحميل الجدول الزمني')
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CLASS':
        return <BookOpen className="w-5 h-5 text-blue-500" />
      case 'ASSIGNMENT':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'MEETING':
        return <Users className="w-5 h-5 text-purple-500" />
      case 'EXAM':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CLASS':
        return 'درس'
      case 'ASSIGNMENT':
        return 'واجب'
      case 'MEETING':
        return 'اجتماع'
      case 'EXAM':
        return 'امتحان'
      default:
        return 'حدث'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800'
      case 'ONGOING':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'قادم'
      case 'ONGOING':
        return 'جاري'
      case 'COMPLETED':
        return 'مكتمل'
      case 'OVERDUE':
        return 'متأخر'
      default:
        return 'غير معروف'
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // Format as HH:MM
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const joinMeeting = (item: ScheduleItem) => {
    if (item.meeting_url) {
      window.open(item.meeting_url, '_blank')
      toast.success('تم فتح رابط الاجتماع')
    } else {
      toast('لا يوجد رابط اجتماع لهذا الحدث')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">الجدول الزمني</h1>
            <p className="text-muted">عرض الجدول الزمني للدروس والأنشطة</p>
          </div>
          <div className="card">
            <div className="text-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-muted">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">الجدول الزمني</h1>
          <p className="text-muted">عرض الجدول الزمني للدروس والأنشطة</p>
        </div>

        {/* Date Selector */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">اختر التاريخ</h2>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="form-input w-auto"
            />
          </div>
        </div>

        {schedule.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد أحداث</h2>
              <p className="text-muted">لا توجد أحداث مجدولة لهذا التاريخ</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((item) => (
              <div key={item.id} className="card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <div className={`badge ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </div>
                      </div>
                      
                      <p className="text-muted mb-3">{item.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-500 ml-2" />
                          <span>{formatTime(item.time)} - {item.duration} دقيقة</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-500 ml-2" />
                          <span>{item.teacher_name}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>

                      {item.location && (
                        <div className="mt-2 text-sm text-muted">
                          <span className="font-medium">الموقع:</span> {item.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {item.type === 'MEETING' && item.status === 'UPCOMING' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => joinMeeting(item)}
                      className="btn-primary inline-flex items-center"
                    >
                      <Users className="w-4 h-4 ml-2" />
                      انضم للاجتماع
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
