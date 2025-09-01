'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { MessageSquare, Send, User, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Teacher {
  id: string
  email: string
  lastMessage: string
  lastMessageTime: string | null
  unreadCount: number
}

interface Message {
  id: string
  content: string
  messageType: string
  createdAt: string
  isRead: boolean
  senderType: 'TEACHER' | 'STUDENT'
}

export default function StudentChatPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
    try {
      const response = await fetch('/api/student/chat')
      if (response.ok) {
        const data = await response.json()
        setTeacher(data.teacher)
        if (data.teacher) {
          fetchMessages(data.teacher.id)
        }
      } else {
        toast.error('فشل في تحميل بيانات المعلم')
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error)
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/student/chat/${teacherId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        toast.error('فشل في تحميل الرسائل')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('حدث خطأ في تحميل الرسائل')
    }
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
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
            <h1 className="text-3xl font-bold text-primary mb-2">الشات</h1>
            <p className="text-muted">التواصل مع المعلم</p>
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

  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">الشات</h1>
            <p className="text-muted">التواصل مع المعلم</p>
          </div>
          <div className="card">
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا يوجد معلم مسند</h2>
              <p className="text-muted">لم يتم إسناد معلم لك بعد. يرجى الانتظار حتى يتم إسناد معلم.</p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">الشات</h1>
          <p className="text-muted">التواصل مع المعلم</p>
        </div>

        <div className="card">
          {/* Teacher Info */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{teacher.email}</h3>
                  <p className="text-sm text-gray-500">المعلم المسند</p>
                </div>
              </div>
              {teacher.unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {teacher.unreadCount} رسائل جديدة
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">لا توجد رسائل من المعلم بعد</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'STUDENT'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center mt-1 text-xs ${
                      message.senderType === 'STUDENT' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3 ml-1" />
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Read-only notice */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="text-center text-gray-500 text-sm">
              <MessageSquare className="w-4 h-4 inline ml-1" />
              يمكنك فقط عرض الرسائل من المعلم
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
