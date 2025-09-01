'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import AudioPlayer from '@/components/AudioPlayer'
import { BookOpen, Calendar, Users, FileText, CheckCircle, Clock, Plus, Edit, Eye, Trash2, X, Star, MessageSquare, Play, Volume2, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Assignment {
  id: string
  title: string
  description: string
  due_at: string
  created_at: string
  stage_name?: string
  target_students: number
  submissions_count: number
  graded_count: number
  status: 'active' | 'overdue'
}

interface Submission {
  id: string
  student_id: string
  student_name: string
  student_email: string
  content: string
  submitted_at: string
  grade: number | null
  feedback: string
  audio_url: string | null
  page_number: number | null
  evaluation_grade: string | null
  current_page: number
  status: 'graded' | 'submitted'
}

const EVALUATION_GRADES = [
  { value: 'متفوق', label: '✅ متفوق', color: 'text-green-600 bg-green-100' },
  { value: 'ممتاز', label: '🌟 ممتاز', color: 'text-blue-600 bg-blue-100' },
  { value: 'جيد', label: '👍 جيد', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'إعادة', label: '🔄 إعادة', color: 'text-orange-600 bg-orange-100' },
  { value: 'غياب', label: '🚫 غياب', color: 'text-red-600 bg-red-100' },
  { value: 'إذن', label: '🕒 إذن', color: 'text-purple-600 bg-purple-100' }
]

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_at: '',
    stage_id: ''
  })
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    due_at: '',
    stage_id: ''
  })
  const [stages, setStages] = useState<any[]>([])
  const [stagesLoading, setStagesLoading] = useState(true)
  const [gradingForm, setGradingForm] = useState({
    submission_id: '',
    grade: '',
    feedback: '',
    page_number: '',
    evaluation_grade: '',
    student_id: ''
  })
  const [quickGradeForm, setQuickGradeForm] = useState({
    student_id: '',
    current_page: '',
    evaluation_grade: ''
  })

  // Statistics
  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
    totalSubmissions: assignments.reduce((sum, a) => sum + a.submissions_count, 0),
    totalGraded: assignments.reduce((sum, a) => sum + a.graded_count, 0)
  }

  useEffect(() => {
    fetchAssignments()
    fetchStages()
  }, [])

    const fetchAssignments = async () => {
    try {
      setLoading(true)
      console.log('🔍 DEBUG: Starting fetchAssignments...')

      const response = await fetch('/api/teacher/assignments')
      console.log('🔍 DEBUG: Response status:', response.status)
      console.log('🔍 DEBUG: Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔍 DEBUG: Response error text:', errorText)
        throw new Error('فشل في تحميل الواجبات')
      }

      const data = await response.json()
      console.log('🔍 DEBUG: Frontend received data:', data)
      console.log('🔍 DEBUG: Data assignments:', data.assignments)
      console.log('🔍 DEBUG: Data assignments length:', data.assignments?.length)

      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('🔍 DEBUG: Error in fetchAssignments:', error)
      toast.error('فشل في تحميل الواجبات')
    } finally {
      setLoading(false)
    }
  }

  const fetchStages = async () => {
    try {
      setStagesLoading(true)
      const response = await fetch('/api/stages')
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 DEBUG: Fetched stages:', data.stages)
        setStages(data.stages || [])
      } else {
        console.error('Failed to fetch stages')
      }
    } catch (error) {
      console.error('Error fetching stages:', error)
    } finally {
      setStagesLoading(false)
    }
  }

  const createTestData = async () => {
    try {
      const response = await fetch('/api/teacher/assignments/create-test', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('فشل في إنشاء البيانات التجريبية')
      
      const data = await response.json()
      toast.success(data.message)
      fetchAssignments() // Refresh the list
    } catch (error) {
      console.error('Error creating test data:', error)
      toast.error('فشل في إنشاء البيانات التجريبية')
    }
  }

  const createTestSubmissions = async (assignmentId: string) => {
    try {
      const response = await fetch('/api/teacher/assignments/create-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignment_id: assignmentId })
      })
      
      if (!response.ok) throw new Error('فشل في إنشاء التسليمات التجريبية')
      
      const data = await response.json()
      toast.success(data.message)
      
      // Refresh submissions if modal is open
      if (showDetailsModal && selectedAssignment) {
        const submissionsResponse = await fetch(`/api/teacher/assignments/${selectedAssignment.id}/submissions`)
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json()
          setSubmissions(submissionsData.submissions || [])
        }
      }
      
      fetchAssignments() // Refresh the list
    } catch (error) {
      console.error('Error creating test submissions:', error)
      toast.error('فشل في إنشاء التسليمات التجريبية')
    }
  }

  const handleViewDetails = async (assignment: Assignment) => {
    try {
      setLoadingSubmissions(true)
      
      // Fetch assignment details
      const detailsResponse = await fetch(`/api/teacher/assignments/${assignment.id}`)
      if (!detailsResponse.ok) throw new Error('فشل في تحميل تفاصيل الواجب')
      
      const details = await detailsResponse.json()
      setSelectedAssignment(details)
      
      // Fetch submissions
      const submissionsResponse = await fetch(`/api/teacher/assignments/${assignment.id}/submissions`)
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData.submissions || [])
      } else {
        const errorData = await submissionsResponse.json()
        console.error('Submissions error:', errorData)
      }
      
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Error fetching assignment details:', error)
      toast.error('فشل في تحميل تفاصيل الواجب')
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleEdit = (assignment: Assignment) => {
    setEditForm({
      title: assignment.title,
      description: assignment.description,
      due_at: assignment.due_at ? new Date(assignment.due_at).toISOString().split('T')[0] : '',
      stage_id: ''
    })
    setSelectedAssignment(assignment)
    setShowEditModal(true)
  }

  const handleUpdateAssignment = async () => {
    if (!selectedAssignment) return

    try {
      const response = await fetch(`/api/teacher/assignments/${selectedAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) throw new Error('فشل في تحديث الواجب')

      toast.success('تم تحديث الواجب بنجاح')
      setShowEditModal(false)
      fetchAssignments() // Refresh the list
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast.error('فشل في تحديث الواجب')
    }
  }

  const handleDelete = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedAssignment) return

    try {
      const response = await fetch(`/api/teacher/assignments/${selectedAssignment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('فشل في حذف الواجب')

      toast.success('تم حذف الواجب بنجاح')
      setShowDeleteModal(false)
      fetchAssignments() // Refresh the list
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('فشل في حذف الواجب')
    }
  }

  const handleAddAssignment = async () => {
    if (!addForm.title || !addForm.description || !addForm.stage_id) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إنشاء الواجب')
      }

      toast.success('تم إنشاء الواجب بنجاح')
      setShowAddModal(false)
      setAddForm({ title: '', description: '', due_at: '', stage_id: '' })
      fetchAssignments() // Refresh the list
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast.error(error instanceof Error ? error.message : 'فشل في إنشاء الواجب')
    }
  }

  const handleGradeSubmission = async (submissionId: string) => {
    if (!selectedAssignment || !gradingForm.evaluation_grade || !gradingForm.page_number) return

    try {
      const response = await fetch(`/api/teacher/assignments/${selectedAssignment.id}/submissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: submissionId,
          grade: parseInt(gradingForm.grade) || 0,
          feedback: gradingForm.feedback,
          page_number: parseInt(gradingForm.page_number),
          evaluation_grade: gradingForm.evaluation_grade,
          student_id: gradingForm.student_id
        }),
      })

      if (!response.ok) throw new Error('فشل في تقييم التسليم')

      const result = await response.json()
      toast.success(result.message)
      setGradingForm({ submission_id: '', grade: '', feedback: '', page_number: '', evaluation_grade: '', student_id: '' })
      
      // Refresh submissions
      const submissionsResponse = await fetch(`/api/teacher/assignments/${selectedAssignment.id}/submissions`)
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData.submissions || [])
      }
      
      fetchAssignments() // Refresh assignments to update counts
    } catch (error) {
      console.error('Error grading submission:', error)
      toast.error('فشل في تقييم التسليم')
    }
  }

  const handleQuickGrade = async (studentId: string, currentPage: number) => {
    if (!selectedAssignment || !quickGradeForm.evaluation_grade) return

    try {
      const response = await fetch(`/api/teacher/assignments/${selectedAssignment.id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          current_page: currentPage,
          evaluation_grade: quickGradeForm.evaluation_grade
        }),
      })

      if (!response.ok) throw new Error('فشل في تسجيل الصفحة')

      const result = await response.json()
      toast.success(result.message)
      setQuickGradeForm({ student_id: '', current_page: '', evaluation_grade: '' })
      
      // Refresh submissions
      const submissionsResponse = await fetch(`/api/teacher/assignments/${selectedAssignment.id}/submissions`)
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData.submissions || [])
      }
      
      fetchAssignments() // Refresh assignments to update counts
    } catch (error) {
      console.error('Error quick grading:', error)
      toast.error('فشل في تسجيل الصفحة')
    }
  }

  const getEvaluationColor = (grade: string) => {
    const evaluation = EVALUATION_GRADES.find(g => g.value === grade)
    return evaluation ? evaluation.color : 'text-gray-600 bg-gray-100'
  }

  const getEvaluationLabel = (grade: string) => {
    const evaluation = EVALUATION_GRADES.find(g => g.value === grade)
    return evaluation ? evaluation.label : grade
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Debug logging
  console.log('🔍 DEBUG: Filtering:', {
    totalAssignments: assignments.length,
    searchTerm,
    statusFilter,
    filteredCount: filteredAssignments.length,
    assignments: assignments.map(a => ({ id: a.id, title: a.title, status: a.status }))
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'overdue': return 'متأخر'
      default: return 'غير محدد'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">الواجبات</h1>
            <p className="text-muted">إدارة وتتبع الواجبات المدرسية</p>
          </div>
          <div className="card">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted mt-4">جاري تحميل الواجبات...</p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">الواجبات</h1>
          <p className="text-muted">إدارة وتتبع الواجبات المدرسية</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted">إجمالي الواجبات</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted">الواجبات النشطة</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted">المتأخرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted">التسليمات</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm text-muted">المصححة</p>
                <p className="text-2xl font-bold text-teal-600">{stats.totalGraded}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="البحث في الواجبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="overdue">متأخر</option>
              </select>

              <button 
                onClick={createTestData}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إنشاء بيانات تجريبية
              </button>

              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة واجب
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-1">{assignment.title}</h3>
                  <p className="text-sm text-muted line-clamp-2">{assignment.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                  {getStatusText(assignment.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {assignment.stage_name && (
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 text-gray-400 ml-2" />
                    <span>{assignment.stage_name}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                  <span>تاريخ الاستحقاق: {assignment.due_at ? new Date(assignment.due_at).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 ml-2" />
                  <span>الطلاب المستهدفون: {assignment.target_students}</span>
                </div>

                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 text-gray-400 ml-2" />
                  <span>التسليمات: {assignment.submissions_count} من {assignment.target_students}</span>
                </div>

                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-gray-400 ml-2" />
                  <span>المصححة: {assignment.graded_count}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>معدل التسليم</span>
                  <span>{assignment.target_students > 0 ? Math.round((assignment.submissions_count / assignment.target_students) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${assignment.target_students > 0 ? (assignment.submissions_count / assignment.target_students) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewDetails(assignment)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  عرض التفاصيل
                </button>
                <button 
                  onClick={() => handleEdit(assignment)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(assignment)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="card">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد واجبات</h2>
              <p className="text-muted">لم يتم العثور على واجبات تطابق معايير البحث</p>
            </div>
          </div>
        )}

        {/* Enhanced Details Modal with New Grading System */}
        {showDetailsModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary">تفاصيل الواجب - نظام التقييم المتقدم</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">عنوان الواجب</h3>
                    <p className="text-gray-900">{selectedAssignment.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">وصف الواجب</h3>
                    <p className="text-gray-900">{selectedAssignment.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">تاريخ الاستحقاق</h3>
                      <p className="text-gray-900">
                        {selectedAssignment.due_at ? new Date(selectedAssignment.due_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">المرحلة</h3>
                      <p className="text-gray-900">{selectedAssignment.stage_name || 'غير محدد'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">الطلاب المستهدفون</h3>
                      <p className="text-gray-900">{selectedAssignment.target_students}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">التسليمات</h3>
                      <p className="text-gray-900">{selectedAssignment.submissions_count} من {selectedAssignment.target_students}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">المصححة</h3>
                      <p className="text-gray-900">{selectedAssignment.graded_count}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">الحالة</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                        {getStatusText(selectedAssignment.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submissions Section */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">التسليمات والتقييم</h3>
                  </div>
                  
                  {loadingSubmissions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted mt-2">جاري تحميل التسليمات...</p>
                    </div>
                  ) : submissions.length > 0 ? (
                    <div className="space-y-4">
                      {submissions.map((submission) => (
                        <div key={submission.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{submission.student_name}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">الصفحة الحالية: {submission.current_page}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                submission.status === 'graded' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                              }`}>
                                {submission.status === 'graded' ? 'مصحح' : 'مُسلم'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{submission.content}</p>
                          
                          {/* Audio Recording */}
                          {submission.audio_url && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                                <Volume2 className="w-4 h-4" />
                                <span>تسجيل صوتي:</span>
                              </div>
                              <AudioPlayer 
                                audioUrl={`/api/uploads/assignments/${submission.audio_url}`}
                                filename={submission.audio_url}
                                className="w-full"
                              />
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mb-3">
                            تم التسليم: {new Date(submission.submitted_at).toLocaleDateString('ar-SA')}
                          </div>

                          {submission.status === 'graded' ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">الدرجة: {submission.grade}/100</span>
                              </div>
                              {submission.evaluation_grade && (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEvaluationColor(submission.evaluation_grade)}`}>
                                    {getEvaluationLabel(submission.evaluation_grade)}
                                  </span>
                                </div>
                              )}
                              {submission.feedback && (
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                                  <span className="text-sm text-gray-700">{submission.feedback}</span>
                                </div>
                              )}
                              {submission.page_number && (
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-gray-700">الصفحة المحدثة: {submission.page_number}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Page Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الصفحة</label>
                                <div className="grid grid-cols-6 gap-2 mb-2">
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((page) => (
                                    <button
                                      key={page}
                                      onClick={() => setGradingForm({
                                        ...gradingForm,
                                        submission_id: submission.id,
                                        page_number: page.toString(),
                                        student_id: submission.student_id
                                      })}
                                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                                        gradingForm.submission_id === submission.id && gradingForm.page_number === page.toString()
                                          ? 'bg-primary text-white border-primary'
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="number"
                                  min="1"
                                  max="30"
                                  value={gradingForm.submission_id === submission.id ? gradingForm.page_number : ''}
                                  onChange={(e) => setGradingForm({
                                    ...gradingForm,
                                    submission_id: submission.id,
                                    page_number: e.target.value,
                                    student_id: submission.student_id
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                  placeholder="أو أدخل رقم الصفحة يدوياً"
                                />
                              </div>
                              
                              {/* Evaluation Grade Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">التقييم</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {EVALUATION_GRADES.map((grade) => (
                                    <button
                                      key={grade.value}
                                      onClick={() => setGradingForm({
                                        ...gradingForm,
                                        submission_id: submission.id,
                                        evaluation_grade: grade.value,
                                        student_id: submission.student_id
                                      })}
                                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                        gradingForm.submission_id === submission.id && gradingForm.evaluation_grade === grade.value
                                          ? 'border-primary bg-primary text-white'
                                          : 'border-gray-300 bg-white hover:bg-gray-50'
                                      }`}
                                    >
                                      {grade.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Grade and Feedback */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة (اختياري)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gradingForm.submission_id === submission.id ? gradingForm.grade : ''}
                                    onChange={(e) => setGradingForm({
                                      ...gradingForm,
                                      submission_id: submission.id,
                                      grade: e.target.value,
                                      student_id: submission.student_id
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="0-100"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">التعليق (اختياري)</label>
                                  <textarea
                                    value={gradingForm.submission_id === submission.id ? gradingForm.feedback : ''}
                                    onChange={(e) => setGradingForm({
                                      ...gradingForm,
                                      submission_id: submission.id,
                                      feedback: e.target.value,
                                      student_id: submission.student_id
                                    })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="أضف تعليقك..."
                                  />
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleGradeSubmission(submission.id)}
                                disabled={!gradingForm.evaluation_grade || !gradingForm.page_number || gradingForm.submission_id !== submission.id}
                                className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                              >
                                تقييم التسليم
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-4">لا توجد تسليمات بعد</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary">تعديل الواجب</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الواجب</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف الواجب</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={editForm.due_at}
                    onChange={(e) => setEditForm({...editForm, due_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleUpdateAssignment}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Assignment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary">إضافة واجب جديد</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الواجب *</label>
                  <input
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm({...addForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="أدخل عنوان الواجب"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف الواجب *</label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="أدخل وصف الواجب"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المرحلة *</label>
                  <select
                    value={addForm.stage_id}
                    onChange={(e) => setAddForm({...addForm, stage_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={stagesLoading}
                  >
                    <option value="">{stagesLoading ? 'جاري التحميل...' : 'اختر المرحلة'}</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={addForm.due_at}
                    onChange={(e) => setAddForm({...addForm, due_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button 
                  onClick={handleAddAssignment}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  إضافة الواجب
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h2>
                <p className="text-gray-600 mb-6">
                  هل أنت متأكد من حذف الواجب "{selectedAssignment.title}"؟ 
                  لا يمكن التراجع عن هذا الإجراء.
                </p>
                
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    حذف
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
