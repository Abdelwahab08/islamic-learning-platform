'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  Search,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Student {
  id: string
  email: string
  stageName: string
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

export default function TeacherChatPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages(selectedStudent.id)
      const interval = setInterval(() => {
        fetchMessages(selectedStudent.id)
      }, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [selectedStudent])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/teacher/chat')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      } else {
        toast.error('فشل في تحميل قائمة الطلاب')
      }
    } catch (error) {
      toast.error('فشل في تحميل قائمة الطلاب')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (studentId: string) => {
    try {
      const response = await fetch(`/api/teacher/chat/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!selectedStudent || !newMessage.trim()) return

    setSending(true)
    try {
      const response = await fetch('/api/teacher/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        setNewMessage('')
        await fetchMessages(selectedStudent.id)
        await fetchStudents() // Refresh student list to update last message
      } else {
        toast.error('فشل في إرسال الرسالة')
      }
    } catch (error) {
      toast.error('فشل في إرسال الرسالة')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA')
  }

  const filteredStudents = students.filter(student =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.stageName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">الشات</h1>
          <p className="text-muted">التواصل مع الطلاب والمعلمين</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Students List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 ml-2" />
                الطلاب المسندين
              </CardTitle>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث في الطلاب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد طلاب مسندين'}
                    </p>
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{student.email}</p>
                            <p className="text-xs text-gray-600">{student.stageName}</p>
                          </div>
                        </div>
                        {student.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {student.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 truncate">
                          {student.lastMessage}
                        </p>
                        {student.lastMessageTime && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(student.lastMessageTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedStudent ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(null)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedStudent.email}</CardTitle>
                        <p className="text-sm text-gray-600">{selectedStudent.stageName}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col h-[calc(100vh-350px)]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">لا توجد رسائل بعد</p>
                          <p className="text-sm text-gray-400">ابدأ المحادثة بإرسال رسالة</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderType === 'TEACHER' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderType === 'TEACHER'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center mt-1 text-xs ${
                                message.senderType === 'TEACHER' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <Clock className="w-3 h-3 ml-1" />
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="اكتب رسالتك هنا..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="btn-primary"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">اختر طالب للبدء في المحادثة</h3>
                  <p className="text-gray-500">اختر طالب من القائمة على اليسار لبدء المحادثة</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
