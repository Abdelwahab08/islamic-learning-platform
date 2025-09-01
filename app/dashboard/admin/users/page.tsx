'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Mail, 
  Calendar,
  Shield,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Save,
  User,
  BookOpen,
  Award,
  FileText,
  UserPlus,
  Link,
  Phone
} from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'ACADEMIC_MOD'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
  last_login?: string
  profile?: {
    first_name?: string
    last_name?: string
    phone?: string
  }
  assignedTeacher?: {
    id: string
    name: string
    email: string
  }
}

interface Teacher {
  id: string
  name: string
  email: string
  assigned_students: number
  verified: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'teachers' | 'students'>('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false)
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [editForm, setEditForm] = useState({
    email: '',
    role: '',
    additionalData: {}
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('فشل في تحميل المستخدمين')
      }
    } catch (error) {
      toast.error('فشل في تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers/available')
      if (response.ok) {
        const data = await response.json()
        setAvailableTeachers(data.teachers || [])
      } else {
        toast.error('فشل في تحميل المعلمين المتاحين')
      }
    } catch (error) {
      toast.error('فشل في تحميل المعلمين المتاحين')
    }
  }

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('تم الموافقة على المستخدم بنجاح')
        fetchUsers()
      } else {
        toast.error('فشل في الموافقة على المستخدم')
      }
    } catch (error) {
      toast.error('فشل في الموافقة على المستخدم')
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('تم رفض المستخدم بنجاح')
        fetchUsers()
      } else {
        toast.error('فشل في رفض المستخدم')
      }
    } catch (error) {
      toast.error('فشل في رفض المستخدم')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('تم حذف المستخدم بنجاح')
        fetchUsers()
      } else {
        toast.error('فشل في حذف المستخدم')
      }
    } catch (error) {
      toast.error('فشل في حذف المستخدم')
    }
  }

  const viewUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const userDetails = await response.json()
        setSelectedUser(userDetails)
        setShowDetailsModal(true)
      } else {
        toast.error('فشل في تحميل تفاصيل المستخدم')
      }
    } catch (error) {
      toast.error('فشل في تحميل تفاصيل المستخدم')
    }
  }

  const editUser = (user: User) => {
    setEditForm({
      email: user.email,
      role: user.role,
      additionalData: {}
    })
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const saveUserEdit = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })
      
      if (response.ok) {
        toast.success('تم تحديث المستخدم بنجاح')
        setShowEditModal(false)
        fetchUsers()
      } else {
        toast.error('فشل في تحديث المستخدم')
      }
    } catch (error) {
      toast.error('فشل في تحديث المستخدم')
    }
  }

  const openAssignTeacherModal = async (user: User) => {
    if (user.role !== 'STUDENT') {
      toast.error('يمكن إسناد المعلمين للطلاب فقط')
      return
    }
    
    setSelectedUser(user)
    setSelectedTeacherId('')
    await fetchAvailableTeachers()
    setShowAssignTeacherModal(true)
  }

  const assignTeacher = async () => {
    if (!selectedTeacherId) {
      toast.error('يرجى اختيار معلم')
      return
    }

    try {
      const response = await fetch('/api/admin/users/assign-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedUser.id,
          teacherId: selectedTeacherId
        })
      })

      if (response.ok) {
        toast.success('تم إسناد الطالب للمعلم بنجاح')
        setShowAssignTeacherModal(false)
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إسناد الطالب للمعلم')
      }
    } catch (error) {
      toast.error('فشل في إسناد الطالب للمعلم')
    }
  }

  const removeTeacherAssignment = async (studentId: string, teacherId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء إسناد الطالب لهذا المعلم؟')) return

    try {
      const response = await fetch(`/api/admin/users/assign-teacher?studentId=${studentId}&teacherId=${teacherId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('تم إلغاء إسناد الطالب بنجاح')
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إلغاء إسناد الطالب')
      }
    } catch (error) {
      toast.error('فشل في إلغاء إسناد الطالب')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-100 text-red-800">مدير</Badge>
      case 'TEACHER':
        return <Badge className="bg-blue-100 text-blue-800">معلم</Badge>
      case 'STUDENT':
        return <Badge className="bg-green-100 text-green-800">طالب</Badge>
      case 'ACADEMIC_MOD':
        return <Badge className="bg-purple-100 text-purple-800">مشرف أكاديمي</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">غير محدد</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">موافق عليه</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">غير محدد</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile?.first_name && user.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.profile?.last_name && user.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === 'pending') {
      return matchesSearch && user.status === 'PENDING' // Show users with pending status
    } else if (activeTab === 'teachers') {
      return matchesSearch && user.role === 'TEACHER'
    } else if (activeTab === 'students') {
      return matchesSearch && user.role === 'STUDENT'
    }
    
    return matchesSearch
  })

  const pendingCount = users.filter(u => u.status === 'PENDING').length
  const teachersCount = users.filter(u => u.role === 'TEACHER').length
  const studentsCount = users.filter(u => u.role === 'STUDENT').length

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
          <h1 className="text-3xl font-bold text-primary mb-2">المستخدمون والموافقات</h1>
          <p className="text-muted">إدارة المستخدمين وطلبات الموافقة</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">في انتظار الموافقة</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المعلمون</p>
                  <p className="text-2xl font-bold text-green-600">{teachersCount}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الطلاب</p>
                  <p className="text-2xl font-bold text-purple-600">{studentsCount}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  onClick={() => setActiveTab('all')}
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  className="btn-primary"
                >
                  جميع المستخدمين
                </Button>
                <Button
                  onClick={() => setActiveTab('pending')}
                  variant={activeTab === 'pending' ? 'default' : 'outline'}
                  className="btn-primary"
                >
                  في الانتظار ({pendingCount})
                </Button>
                <Button
                  onClick={() => setActiveTab('teachers')}
                  variant={activeTab === 'teachers' ? 'default' : 'outline'}
                  className="btn-primary"
                >
                  المعلمون ({teachersCount})
                </Button>
                <Button
                  onClick={() => setActiveTab('students')}
                  variant={activeTab === 'students' ? 'default' : 'outline'}
                  className="btn-primary"
                >
                  الطلاب ({studentsCount})
                </Button>
              </div>

              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث في المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-6">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مستخدمين للعرض'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center ml-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {user.profile?.first_name && user.profile?.last_name 
                            ? `${user.profile.first_name} ${user.profile.last_name}`
                            : user.email
                          }
                        </CardTitle>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Shield className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">الدور:</span>
                        <span className="mr-2">
                          {user.role === 'ADMIN' ? 'مدير' :
                           user.role === 'TEACHER' ? 'معلم' :
                           user.role === 'STUDENT' ? 'طالب' :
                           user.role === 'ACADEMIC_MOD' ? 'مشرف أكاديمي' : 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">تاريخ التسجيل:</span>
                        <span className="mr-2">{formatDate(user.created_at)}</span>
                      </div>
                      {user.role === 'STUDENT' && user.assignedTeacher && (
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 text-gray-500 ml-2" />
                          <span className="font-medium">المعلم المسند:</span>
                          <span className="mr-2 text-blue-600">{user.assignedTeacher.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">آخر تسجيل دخول:</span>
                        <span className="mr-2">غير متوفر</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">الهاتف:</span>
                        <span className="mr-2">غير متوفر</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {user.status === 'PENDING' && (
                      <>
                        <Button
                          onClick={() => approveUser(user.id)}
                          className="btn-primary"
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          موافقة
                        </Button>
                        <Button
                          onClick={() => rejectUser(user.id)}
                          variant="outline"
                          className="btn-outline text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض
                        </Button>
                      </>
                    )}
                    
                    {user.role === 'STUDENT' && (
                      <Button
                        onClick={() => openAssignTeacherModal(user)}
                        variant="outline"
                        className="btn-outline text-blue-600 hover:text-blue-700"
                      >
                        <UserPlus className="w-4 h-4 ml-2" />
                        {user.assignedTeacher ? 'تغيير المعلم' : 'إسناد معلم'}
                      </Button>
                    )}
                    
                    {user.role === 'STUDENT' && user.assignedTeacher && (
                      <Button
                        onClick={() => removeTeacherAssignment(user.id, user.assignedTeacher!.id)}
                        variant="outline"
                        className="btn-outline text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 ml-2" />
                        إلغاء الإسناد
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="btn-outline"
                      onClick={() => viewUserDetails(user.id)}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض التفاصيل
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="btn-outline"
                      onClick={() => editUser(user)}
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    
                    <Button
                      onClick={() => deleteUser(user.id)}
                      variant="outline"
                      className="btn-outline text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">تفاصيل المستخدم</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">البريد الإلكتروني:</span>
                    <span className="mr-2">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">الدور:</span>
                    <span className="mr-2">
                      {selectedUser.role === 'ADMIN' ? 'مدير' :
                       selectedUser.role === 'TEACHER' ? 'معلم' :
                       selectedUser.role === 'STUDENT' ? 'طالب' : 'غير محدد'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">تاريخ التسجيل:</span>
                    <span className="mr-2">{formatDate(selectedUser.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">حالة الموافقة:</span>
                    <span className="mr-2">
                      {selectedUser.status === 'APPROVED' ? 'موافق عليه' :
                       selectedUser.status === 'PENDING' ? 'في الانتظار' :
                       selectedUser.status === 'REJECTED' ? 'مرفوض' : 'غير محدد'}
                    </span>
                  </div>
                </div>
                
                {selectedUser.role === 'TEACHER' && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">الاسم الكامل:</span>
                      <span className="mr-2">{selectedUser.fullName || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">رقم الهاتف:</span>
                      <span className="mr-2">{selectedUser.phoneNumber || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">عدد الطلاب:</span>
                      <span className="mr-2">{selectedUser.studentsCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">عدد الشهادات:</span>
                      <span className="mr-2">{selectedUser.certificatesCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">الحالة:</span>
                      <span className="mr-2">
                        {selectedUser.verified ? 'موثق' : 'غير موثق'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Teacher Bio and CV Section */}
                {selectedUser.role === 'TEACHER' && (
                  <div className="col-span-1 md:col-span-2 mt-6">
                    <div className="space-y-4">
                      {selectedUser.bio && selectedUser.bio !== 'غير محدد' && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <FileText className="w-5 h-5 ml-2 text-primary" />
                            السيرة الذاتية والخبرة
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{selectedUser.bio}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.cvFile && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <FileText className="w-5 h-5 ml-2 text-primary" />
                            السيرة الذاتية المرفقة
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <a 
                              href={`/uploads/teachers/${selectedUser.cvFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <FileText className="w-4 h-4 ml-2" />
                              عرض الملف المرفق
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedUser.role === 'STUDENT' && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">المرحلة الحالية:</span>
                      <span className="mr-2">{selectedUser.currentStage || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">عدد التقديمات:</span>
                      <span className="mr-2">{selectedUser.submissionsCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">عدد الشهادات:</span>
                      <span className="mr-2">{selectedUser.certificatesCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">المعلم المسند:</span>
                      <span className="mr-2">
                        {selectedUser.assignedTeacher ? (
                          <span className="text-blue-600">{selectedUser.assignedTeacher.name}</span>
                        ) : (
                          <span className="text-gray-500">لم يتم إسناد معلم بعد</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">تعديل المستخدم</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="ADMIN">مدير</option>
                  <option value="TEACHER">معلم</option>
                  <option value="STUDENT">طالب</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveUserEdit}
                  className="btn-primary flex-1"
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التغييرات
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignTeacherModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">إسناد معلم للطالب</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignTeacherModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الطالب
                </label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedUser.email}</p>
                  {selectedUser.assignedTeacher && (
                    <p className="text-sm text-gray-600 mt-1">
                      المعلم الحالي: {selectedUser.assignedTeacher.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر المعلم
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">اختر معلم...</option>
                  {availableTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.assigned_students} طالب)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={assignTeacher}
                  disabled={!selectedTeacherId}
                  className="btn-primary flex-1"
                >
                  <Link className="w-4 h-4 ml-2" />
                  إسناد المعلم
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignTeacherModal(false)}
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
