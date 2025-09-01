'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { AlertTriangle, Plus, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Complaint {
  id: string
  title: string
  description: string
  category: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'
  created_at: string
  updated_at: string
  replies_count: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface ComplaintReply {
  id: string
  complaint_id: string
  message: string
  is_admin_reply: boolean
  created_at: string
  user_name: string
}

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [replies, setReplies] = useState<ComplaintReply[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewComplaint, setShowNewComplaint] = useState(false)
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM'
  })
  const [newReply, setNewReply] = useState('')

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

  const fetchReplies = async (complaintId: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/replies`)
      if (response.ok) {
        const data = await response.json()
        setReplies(data)
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComplaint),
      })

      if (response.ok) {
        toast.success('تم إرسال الشكوى بنجاح')
        setShowNewComplaint(false)
        setNewComplaint({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM' })
        fetchComplaints()
      } else {
        toast.error('فشل في إرسال الشكوى')
      }
    } catch (error) {
      console.error('Error submitting complaint:', error)
      toast.error('حدث خطأ في إرسال الشكوى')
    }
  }

  const submitReply = async (complaintId: string) => {
    if (!newReply.trim()) return

    try {
      const response = await fetch(`/api/complaints/${complaintId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newReply }),
      })

      if (response.ok) {
        toast.success('تم إرسال الرد بنجاح')
        setNewReply('')
        fetchReplies(complaintId)
        fetchComplaints() // Refresh complaints to update reply count
      } else {
        toast.error('فشل في إرسال الرد')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error('حدث خطأ في إرسال الرد')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'IN_PROGRESS':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار'
      case 'IN_PROGRESS':
        return 'قيد المعالجة'
      case 'RESOLVED':
        return 'تم الحل'
      case 'REJECTED':
        return 'مرفوض'
      default:
        return 'غير معروف'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
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
            <h1 className="text-3xl font-bold text-primary mb-2">الشكاوى</h1>
            <p className="text-muted">إدارة الشكاوى والاستفسارات</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">الشكاوى</h1>
            <p className="text-muted">إدارة الشكاوى والاستفسارات</p>
          </div>
          <button
            onClick={() => setShowNewComplaint(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 ml-2" />
            شكوى جديدة
          </button>
        </div>

        {/* New Complaint Modal */}
        {showNewComplaint && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">شكوى جديدة</h2>
            <form onSubmit={submitComplaint} className="space-y-4">
              <div>
                <label className="form-label">عنوان الشكوى</label>
                <input
                  type="text"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">التفاصيل</label>
                <textarea
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="form-input"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">الفئة</label>
                  <select
                    value={newComplaint.category}
                    onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                    className="form-input"
                  >
                    <option value="GENERAL">عام</option>
                    <option value="TECHNICAL">تقني</option>
                    <option value="ACADEMIC">أكاديمي</option>
                    <option value="FINANCIAL">مالي</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">الأولوية</label>
                  <select
                    value={newComplaint.priority}
                    onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                    className="form-input"
                  >
                    <option value="LOW">منخفضة</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="HIGH">عالية</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 space-x-reverse">
                <button type="submit" className="btn-primary">
                  إرسال الشكوى
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewComplaint(false)}
                  className="btn-outline"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        {complaints.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد شكاوى</h2>
              <p className="text-muted">لم تقم بإرسال أي شكاوى بعد</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 text-primary ml-2" />
                    <h3 className="text-lg font-bold">{complaint.title}</h3>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <div className={`badge ${getStatusColor(complaint.status)}`}>
                      {getStatusIcon(complaint.status)}
                      <span className="mr-1">{getStatusText(complaint.status)}</span>
                    </div>
                    <div className={`badge ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority === 'HIGH' ? 'عالية' : 
                       complaint.priority === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                    </div>
                  </div>
                </div>

                <p className="text-muted mb-4">{complaint.description}</p>

                <div className="flex items-center justify-between text-sm text-muted mb-4">
                  <span>تاريخ الإرسال: {formatDate(complaint.created_at)}</span>
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 ml-1" />
                    <span>{complaint.replies_count} رد</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedComplaint(selectedComplaint?.id === complaint.id ? null : complaint)
                    if (selectedComplaint?.id !== complaint.id) {
                      fetchReplies(complaint.id)
                    }
                  }}
                  className="btn-outline"
                >
                  {selectedComplaint?.id === complaint.id ? 'إخفاء الردود' : 'عرض الردود'}
                </button>

                {/* Replies Section */}
                {selectedComplaint?.id === complaint.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-bold mb-3">الردود</h4>
                    <div className="space-y-3 mb-4">
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-3 rounded-lg ${
                            reply.is_admin_reply ? 'bg-blue-50 border-r-4 border-blue-500' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{reply.user_name}</span>
                            <span className="text-sm text-muted">{formatDate(reply.created_at)}</span>
                          </div>
                          <p className="text-sm">{reply.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Reply */}
                    <div className="space-y-2">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        className="form-input"
                        rows={3}
                      />
                      <button
                        onClick={() => submitReply(complaint.id)}
                        disabled={!newReply.trim()}
                        className="btn-primary"
                      >
                        إرسال الرد
                      </button>
                    </div>
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
