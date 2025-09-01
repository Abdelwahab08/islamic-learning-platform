'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Calendar, Video, MapPin, Clock, Users, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Meeting {
  id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  provider: string
  teacher_name: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  join_url?: string
  stage_name?: string
}

export default function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeetings()
  }, [])

      const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/student/meetings')
      if (response.ok) {
        const data = await response.json()
        setMeetings(data)
      } else {
        toast.error('فشل في تحميل الاجتماعات')
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error('حدث خطأ في تحميل الاجتماعات')
    } finally {
      setLoading(false)
    }
  }

  const joinMeeting = (meeting: Meeting) => {
    if (meeting.provider === 'ZOOM' && meeting.join_url) {
      window.open(meeting.join_url, '_blank')
      toast.success('تم فتح رابط الاجتماع')
    } else {
      toast('هذا اجتماع حضوري')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'مجدول'
      case 'COMPLETED':
        return 'مكتمل'
      case 'CANCELLED':
        return 'ملغي'
      default:
        return 'غير معروف'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صحيح'
    }
    
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">الاجتماعات</h1>
            <p className="text-muted">عرض الاجتماعات المجدولة</p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">الاجتماعات</h1>
          <p className="text-muted">عرض الاجتماعات المجدولة</p>
        </div>

        {meetings.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد اجتماعات</h2>
              <p className="text-muted">لم يتم جدولة أي اجتماعات لك بعد</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {meeting.provider === 'ZOOM' ? (
                      <Video className="w-6 h-6 text-primary ml-2" />
                    ) : (
                      <MapPin className="w-6 h-6 text-primary ml-2" />
                    )}
                    <h3 className="text-lg font-bold">{meeting.title}</h3>
                  </div>
                  <div className={`badge ${getStatusColor(meeting.status)}`}>
                    {getStatusText(meeting.status)}
                  </div>
                </div>

                <p className="text-muted mb-4">{meeting.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                    <span>{formatDate(meeting.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-gray-500 ml-2" />
                    <span>{meeting.duration_minutes} دقيقة</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 text-gray-500 ml-2" />
                    <span>{meeting.teacher_name}</span>
                  </div>
                  {meeting.stage_name && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-gray-500 ml-2" />
                      <span>{meeting.stage_name}</span>
                    </div>
                  )}
                </div>

                {meeting.status === 'SCHEDULED' && (
                  <button
                    onClick={() => joinMeeting(meeting)}
                    className="btn-primary w-full inline-flex items-center justify-center"
                  >
                    {meeting.provider === 'ZOOM' ? (
                      <>
                        <Video className="w-4 h-4 ml-2" />
                        انضم للاجتماع
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 ml-2" />
                        عرض الموقع
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
