'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Users, Search, Filter, Eye, Edit, Phone, Mail, Calendar, BookOpen, Award, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Student {
  id: string
  name: string
  email: string
  phone: string
  join_date: string
  current_stage: string
  progress_percentage: number
  total_assignments: number
  completed_assignments: number
  certificates_count: number
  last_activity: string
  status: 'active' | 'inactive' | 'suspended'
  group_name?: string
  teacher_notes?: string
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Statistics
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    suspended: students.filter(s => s.status === 'suspended').length,
    averageProgress: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.progress_percentage, 0) / students.length)
      : 0
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/students')
      if (!response.ok) throw new Error('فشل في تحميل بيانات الطلاب')
      
      const data = await response.json()
      setStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('فشل في تحميل بيانات الطلاب')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    const matchesStage = stageFilter === 'all' || student.current_stage === stageFilter
    
    return matchesSearch && matchesStatus && matchesStage
  })

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setShowDetails(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-yellow-600 bg-yellow-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'suspended': return 'معلق'
      default: return 'غير محدد'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">عرض الطلاب</h1>
            <p className="text-muted">إدارة ومتابعة الطلاب</p>
          </div>
          <div className="card">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted mt-4">جاري تحميل بيانات الطلاب...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-1">عرض الطلاب</h1>
            <p className="text-muted text-sm">إدارة ومتابعة الطلاب</p>
          </div>
        </div>

        {/* Statistics Cards - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="card p-3">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mr-3">
                <p className="text-xs text-muted">إجمالي الطلاب</p>
                <p className="text-lg font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="mr-3">
                <p className="text-xs text-muted">الطلاب النشطون</p>
                <p className="text-lg font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="mr-3">
                <p className="text-xs text-muted">غير النشطون</p>
                <p className="text-lg font-bold text-yellow-600">{stats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="w-4 h-4 text-red-600" />
              </div>
              <div className="mr-3">
                <p className="text-xs text-muted">المعلقون</p>
                <p className="text-lg font-bold text-red-600">{stats.suspended}</p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <BookOpen className="w-4 h-4 text-teal-600" />
              </div>
              <div className="mr-3">
                <p className="text-xs text-muted">متوسط التقدم</p>
                <p className="text-lg font-bold text-teal-600">{stats.averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search - Compact */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث عن طالب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="suspended">معلق</option>
              </select>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="all">جميع المراحل</option>
                <option value="المرحلة الأولى">المرحلة الأولى</option>
                <option value="المرحلة الثانية">المرحلة الثانية</option>
                <option value="المرحلة الثالثة">المرحلة الثالثة</option>
                <option value="المرحلة الرابعة">المرحلة الرابعة</option>
                <option value="المرحلة الخامسة">المرحلة الخامسة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{student.name || 'غير محدد'}</h3>
                  <p className="text-sm text-muted">{student.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                  {getStatusText(student.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 ml-2" />
                  <span>{student.phone}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                  <span>انضم في: {new Date(student.join_date).toLocaleDateString('ar-SA')}</span>
                </div>

                <div className="flex items-center text-sm">
                  <BookOpen className="w-4 h-4 text-gray-400 ml-2" />
                  <span>المرحلة: {student.current_stage}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Award className="w-4 h-4 text-gray-400 ml-2" />
                  <span>الشهادات: {student.certificates_count}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>التقدم</span>
                  <span>{student.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${student.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(student)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="card">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد نتائج</h2>
              <p className="text-muted">لم يتم العثور على طلاب يطابقون معايير البحث</p>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {showDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">تفاصيل الطالب</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                      <p className="text-lg">{selectedStudent.name || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                      <p className="text-lg">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                      <p className="text-lg">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانضمام</label>
                      <p className="text-lg">{new Date(selectedStudent.join_date).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">المعلومات الأكاديمية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة الحالية</label>
                        <p className="text-lg">{selectedStudent.current_stage}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نسبة التقدم</label>
                        <p className="text-lg">{selectedStudent.progress_percentage}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الواجبات المكتملة</label>
                        <p className="text-lg">{selectedStudent.completed_assignments} من {selectedStudent.total_assignments}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عدد الشهادات</label>
                        <p className="text-lg">{selectedStudent.certificates_count}</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">النشاط</h3>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span>آخر نشاط: {new Date(selectedStudent.last_activity).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedStudent.teacher_notes && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">ملاحظات المعلم</h3>
                      <p className="text-gray-700">{selectedStudent.teacher_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    تعديل البيانات
                  </button>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
