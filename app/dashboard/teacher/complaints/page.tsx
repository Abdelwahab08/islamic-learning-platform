'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Calendar,
  User,
  X,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Complaint {
  id: string
  subject: string
  content: string
  status: string
  createdAt: string
  updatedAt: string
  studentEmail: string
  stageName: string
}

interface Student {
  id: string
  email: string
  stageName: string
}

export default function TeacherComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    studentId: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    fetchComplaints()
    fetchStudents()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/teacher/complaints')
      if (response.ok) {
        const data = await response.json()
        setComplaints(data.complaints || [])
      } else {
        toast.error('فشل في تحميل الشكاوى')
      }
    } catch (error) {
      toast.error('فشل في تحميل الشكاوى')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/teacher/chat')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const createComplaint = async () => {
    if (!createForm.studentId || !createForm.subject || !createForm.content) {
      toast.error('جميع الحقول مطلوبة')
      return
    }

    try {
      const response = await fetch('/api/teacher/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        toast.success('تم إنشاء الشكوى بنجاح')
        setShowCreateModal(false)
        setCreateForm({ studentId: '', subject: '', content: '' })
        fetchComplaints()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إنشاء الشكوى')
      }
    } catch (error) {
      toast.error('فشل في إنشاء الشكوى')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800">تم الحل</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">قيد المعالجة</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">غير محدد</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

  const filteredComplaints = complaints.filter(complaint =>
    complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.content.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-primary mb-2">الشكاوى</h1>
          <p className="text-muted">إدارة شكاوى الطلاب</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الشكاوى</p>
                  <p className="text-2xl font-bold text-blue-600">{complaints.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {complaints.filter(c => c.status === 'PENDING').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد المعالجة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {complaints.filter(c => c.status === 'IN_PROGRESS').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تم الحل</p>
                  <p className="text-2xl font-bold text-green-600">
                    {complaints.filter(c => c.status === 'RESOLVED').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث في الشكاوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة شكوى جديدة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <div className="grid gap-6">
          {filteredComplaints.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد شكاوى للعرض'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center ml-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                        <p className="text-sm text-gray-600">{complaint.studentEmail}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">الطالب:</span>
                        <span className="mr-2">{complaint.studentEmail}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">تاريخ الإنشاء:</span>
                        <span className="mr-2">{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="font-medium">المرحلة:</span>
                        <span className="mr-2">{complaint.stageName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium">آخر تحديث:</span>
                        <span className="mr-2">{formatDate(complaint.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{complaint.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">إضافة شكوى جديدة</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الطالب
                </label>
                <select
                  value={createForm.studentId}
                  onChange={(e) => setCreateForm({...createForm, studentId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">اختر طالب...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.email} - {student.stageName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الشكوى
                </label>
                <Input
                  type="text"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({...createForm, subject: e.target.value})}
                  placeholder="أدخل عنوان الشكوى"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تفاصيل الشكوى
                </label>
                <Textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                  placeholder="أدخل تفاصيل الشكوى"
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={createComplaint}
                  disabled={!createForm.studentId || !createForm.subject || !createForm.content}
                  className="btn-primary flex-1"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال الشكوى
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
