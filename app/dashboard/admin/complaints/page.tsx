'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { MessageSquare, Eye, Reply } from 'lucide-react'
import toast from 'react-hot-toast'

interface Complaint {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  replies_count: number
  student_name: string
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints')
      if (response.ok) {
        const data = await response.json()
        setComplaints(data)
      } else {
        toast.error('فشل في تحميل الشكاوى')
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('حدث خطأ في تحميل الشكاوى')
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async (complaintId: string) => {
    if (!replyMessage.trim()) {
      toast.error('الرجاء كتابة رد')
      return
    }

    try {
      const response = await fetch(`/api/complaints/${complaintId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: replyMessage }),
      })

      if (response.ok) {
        toast.success('تم إرسال الرد بنجاح')
        setReplyMessage('')
        setSelectedComplaint(null)
        fetchComplaints()
      } else {
        toast.error('فشل في إرسال الرد')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('حدث خطأ في إرسال الرد')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">إدارة الشكاوى</h1>
            <p className="text-muted">عرض وإدارة شكاوى الطلاب</p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">إدارة الشكاوى</h1>
          <p className="text-muted">عرض وإدارة شكاوى الطلاب</p>
        </div>

        {complaints.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد شكاوى</h2>
              <p className="text-muted">لم يتم إرسال أي شكاوى بعد</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <MessageSquare className="w-6 h-6 text-primary ml-2" />
                    <h3 className="text-lg font-bold">{complaint.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className={`badge ${getStatusColor(complaint.status)}`}>
                      {complaint.status === 'PENDING' ? 'قيد الانتظار' : complaint.status}
                    </div>
                    <div className={`badge ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority === 'MEDIUM' ? 'متوسط' : complaint.priority}
                    </div>
                  </div>
                </div>

                <p className="text-muted mb-4">{complaint.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">الطالب:</span> {complaint.student_name}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">التاريخ:</span>{' '}
                    {new Date(complaint.created_at).toLocaleDateString('ar-SA')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">عدد الردود:</span> {complaint.replies_count}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedComplaint(complaint)}
                    className="btn-secondary inline-flex items-center"
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => setSelectedComplaint(complaint)}
                    className="btn-primary inline-flex items-center"
                  >
                    <Reply className="w-4 h-4 ml-2" />
                    رد
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">رد على الشكوى</h3>
              <div className="mb-4">
                <p className="text-sm text-muted mb-2">الشكوى:</p>
                <p className="text-sm">{selectedComplaint.description}</p>
              </div>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="اكتب ردك هنا..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={4}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedComplaint(null)
                    setReplyMessage('')
                  }}
                  className="btn-secondary flex-1"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => sendReply(selectedComplaint.id)}
                  className="btn-primary flex-1"
                >
                  إرسال الرد
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
