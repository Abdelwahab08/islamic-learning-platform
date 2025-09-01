'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Download, Eye, CheckCircle, Clock, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Certificate {
  id: string
  student_name: string
  stage_name: string
  status: string
  issued_at: string
  grade: string
}

interface Student {
  id: string
  name: string
  email: string
}

interface Stage {
  id: string
  name_ar: string
  code: string
}

export default function TeacherCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [createForm, setCreateForm] = useState({
    student_id: '',
    stage_id: '',
    issue_date: '',
    grade: ''
  })

  useEffect(() => {
    fetchCertificates()
    fetchStudents()
    fetchStages()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/teacher/certificates')
      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates || [])
      } else {
        toast.error('فشل في تحميل الشهادات')
        setCertificates([])
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('حدث خطأ في تحميل الشهادات')
      setCertificates([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/teacher/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/stages')
      if (response.ok) {
        const data = await response.json()
        setStages(data.stages || [])
      }
    } catch (error) {
      console.error('Error fetching stages:', error)
    }
  }

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowViewModal(true)
  }

  const handleCreateCertificate = async () => {
    if (!createForm.student_id || !createForm.stage_id || !createForm.issue_date) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/teacher/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: createForm.student_id,
          stage_id: createForm.stage_id,
          issue_date: createForm.issue_date,
          grade: createForm.grade || 'ممتاز'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم إنشاء الشهادة بنجاح وإرسالها للمدير للموافقة')
        setShowCreateModal(false)
        setCreateForm({ student_id: '', stage_id: '', issue_date: '', grade: '' })
        fetchCertificates() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إنشاء الشهادة')
      }
    } catch (error) {
      console.error('Error creating certificate:', error)
      toast.error('حدث خطأ في إنشاء الشهادة')
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'REJECTED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'REJECTED':
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'موافق عليه'
      case 'PENDING':
        return 'في الانتظار'
      case 'REJECTED':
        return 'مرفوض'
      default:
        return 'غير معروف'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <GraduationCap className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">الشهادات</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إنشاء شهادة جديدة
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الشهادات</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">موافق عليه</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">في الانتظار</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">مرفوض</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(c => c.status === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة الشهادات</h2>
        </div>
        
        {certificates.length === 0 ? (
          <div className="p-6 text-center">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد شهادات متاحة</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              إنشاء شهادة جديدة
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المرحلة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإصدار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {certificate.student_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {certificate.stage_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                        {getStatusIcon(certificate.status)}
                        <span className="mr-1">{getStatusText(certificate.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(certificate.issued_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {certificate.status === 'APPROVED' && (
                          <button
                            onClick={() => window.open(`/api/certificates/${certificate.id}/download`, '_blank')}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Download className="w-4 h-4 ml-1" />
                            تحميل
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewCertificate(certificate)}
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">إنشاء شهادة جديدة</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اختر الطالب</label>
                <select
                  value={createForm.student_id}
                  onChange={(e) => setCreateForm({...createForm, student_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">اختر الطالب...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name || student.email.split('@')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اختر المرحلة</label>
                <select
                  value={createForm.stage_id}
                  onChange={(e) => setCreateForm({...createForm, stage_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">اختر المرحلة...</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإصدار</label>
                <input
                  type="date"
                  value={createForm.issue_date}
                  onChange={(e) => setCreateForm({...createForm, issue_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدرجة (اختياري)</label>
                <select
                  value={createForm.grade}
                  onChange={(e) => setCreateForm({...createForm, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="ممتاز">ممتاز</option>
                  <option value="جيد جداً">جيد جداً</option>
                  <option value="جيد">جيد</option>
                  <option value="مقبول">مقبول</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button 
                onClick={handleCreateCertificate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                إنشاء وإرسال للمدير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">تفاصيل الشهادة</h2>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إسم الطالب</label>
                <p className="text-lg font-semibold text-gray-900">{selectedCertificate.student_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المرحلة</label>
                <p className="text-lg font-semibold text-gray-900">{selectedCertificate.stage_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCertificate.status)}`}>
                  {getStatusIcon(selectedCertificate.status)}
                  <span className="mr-1">{getStatusText(selectedCertificate.status)}</span>
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإصدار</label>
                <p className="text-lg font-semibold text-gray-900">{new Date(selectedCertificate.issued_at).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدرجة</label>
                <p className="text-lg font-semibold text-gray-900">{selectedCertificate.grade}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إغلاق
              </button>
              {selectedCertificate.status === 'APPROVED' && (
                <button 
                  onClick={() => window.open(`/api/certificates/${selectedCertificate.id}/download`, '_blank')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  تحميل الشهادة
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
