'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, UserPlus, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface Group {
  id: string
  name: string
  description: string
  max_students: number
  current_students: number
  created_at: string
  teacher_name: string
}

interface Student {
  id: string
  name: string
  email: string
  current_stage: string
  join_date: string
  status: string
}

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    max_students: 20,
    level_stage_id: ''
  })
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    max_students: 20,
    level_stage_id: ''
  })
  const [addStudentForm, setAddStudentForm] = useState({
    student_id: ''
  })
  const [stages, setStages] = useState<any[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [groupStudents, setGroupStudents] = useState<any[]>([])

  useEffect(() => {
    fetchGroups()
    fetchStages()
    fetchStudents()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/teacher/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      } else {
        toast.error('فشل في تحميل المجموعات')
        setGroups([])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('حدث خطأ في تحميل المجموعات')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStages = async () => {
    try {
      const response = await fetch('/api/stages')
      if (response.ok) {
        const data = await response.json()
        setStages(data.stages || [])
      } else {
        toast.error('فشل في تحميل المراحل')
        setStages([])
      }
    } catch (error) {
      console.error('Error fetching stages:', error)
      toast.error('حدث خطأ في تحميل المراحل')
      setStages([])
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/teacher/students')
      if (response.ok) {
        const data = await response.json()
        console.log('Students API response:', data)
        setStudents(data.students || [])
      } else {
        const errorData = await response.json()
        console.error('Students API error:', errorData)
        toast.error('فشل في تحميل الطلاب')
        setStudents([])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('حدث خطأ في تحميل الطلاب')
      setStudents([])
    }
  }

  const fetchGroupStudents = async (groupId: string) => {
    try {
      const response = await fetch(`/api/teacher/groups/${groupId}/students`)
      if (response.ok) {
        const data = await response.json()
        console.log('Group students API response:', data)
        setGroupStudents(data.students || [])
      } else {
        const errorData = await response.json()
        console.error('Group students API error:', errorData)
        setGroupStudents([])
      }
    } catch (error) {
      console.error('Error fetching group students:', error)
      setGroupStudents([])
    }
  }

  const handleViewGroup = (group: Group) => {
    setSelectedGroup(group)
    fetchGroupStudents(group.id)
    setShowViewModal(true)
  }

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group)
    setEditForm({
      name: group.name,
      description: group.description,
      max_students: group.max_students,
      level_stage_id: ''
    })
    setShowEditModal(true)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/groups/${groupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('تم حذف المجموعة بنجاح')
        fetchGroups()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حذف المجموعة')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('حدث خطأ في حذف المجموعة')
    }
  }

  const handleUpdateGroup = async () => {
    if (!selectedGroup || !editForm.name || !editForm.max_students) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch(`/api/teacher/groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast.success('تم تحديث المجموعة بنجاح')
        setShowEditModal(false)
        setSelectedGroup(null)
        fetchGroups()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في تحديث المجموعة')
      }
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error('حدث خطأ في تحديث المجموعة')
    }
  }

  const handleAddStudent = async (group: Group) => {
    setSelectedGroup(group)
    setAddStudentForm({ student_id: '' }) // Reset form
    await fetchStudents()
    await fetchGroupStudents(group.id) // Get current group students to filter them out
    setShowAddStudentModal(true)
  }

  const handleAddStudentToGroup = async () => {
    if (!selectedGroup || !addStudentForm.student_id) {
      toast.error('يرجى اختيار الطالب')
      return
    }

    try {
      const response = await fetch(`/api/teacher/groups/${selectedGroup.id}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addStudentForm)
      })

      if (response.ok) {
        toast.success('تم إضافة الطالب للمجموعة بنجاح')
        setShowAddStudentModal(false)
        setAddStudentForm({ student_id: '' })
        setSelectedGroup(null)
        fetchGroups()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إضافة الطالب')
      }
    } catch (error) {
      console.error('Error adding student to group:', error)
      toast.error('حدث خطأ في إضافة الطالب')
    }
  }

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا الطالب من المجموعة؟')) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/groups/${groupId}/students/${studentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('تم إزالة الطالب من المجموعة بنجاح')
        if (selectedGroup) {
          fetchGroupStudents(selectedGroup.id)
        }
        fetchGroups()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إزالة الطالب')
      }
    } catch (error) {
      console.error('Error removing student from group:', error)
      toast.error('حدث خطأ في إزالة الطالب')
    }
  }

  const handleCreateGroup = async () => {
    if (!createForm.name || !createForm.max_students) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/teacher/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم إنشاء المجموعة بنجاح')
        setShowCreateModal(false)
        setCreateForm({
          name: '',
          description: '',
          max_students: 20,
          level_stage_id: ''
        })
        fetchGroups() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إنشاء المجموعة')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('حدث خطأ في إنشاء المجموعة')
    }
  }

  const getCapacityPercentage = (current: number, max: number) => {
    const currentStudents = current || 0
    const maxStudents = max || 20
    return Math.round((currentStudents / maxStudents) * 100)
  }

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
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
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">المجموعات</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center"
        >
          <Plus className="w-4 h-4 ml-2" />
          إنشاء مجموعة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المجموعات</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الطلاب</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, group) => sum + (group.current_students || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">السعة المتاحة</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, group) => sum + ((group.max_students || 20) - (group.current_students || 0)), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">متوسط الحجم</p>
              <p className="text-2xl font-bold text-gray-900">
                {groups.length > 0 ? Math.round(groups.reduce((sum, group) => sum + (group.current_students || 0), 0) / groups.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const capacityPercentage = getCapacityPercentage(group.current_students, group.max_students)
          return (
            <div key={group.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                                     <div className="flex items-center space-x-2 space-x-reverse">
                     <button 
                       onClick={() => handleViewGroup(group)}
                       className="text-blue-600 hover:text-blue-900 p-1"
                     >
                       <Eye className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleEditGroup(group)}
                       className="text-green-600 hover:text-green-900 p-1"
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleDeleteGroup(group.id)}
                       className="text-red-600 hover:text-red-900 p-1"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">الطلاب:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {group.current_students}/{group.max_students}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        capacityPercentage >= 90 ? 'bg-red-500' : 
                        capacityPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${capacityPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">السعة</span>
                    <span className={`text-xs font-medium ${getCapacityColor(capacityPercentage)}`}>
                      {capacityPercentage}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">المعلم:</span>
                    <span className="text-sm font-medium text-gray-900">{group.teacher_name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">تاريخ الإنشاء:</span>
                    <span className="text-sm text-gray-900">
                      {group.created_at ? new Date(group.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                                     <div className="flex items-center justify-between">
                     <button 
                       onClick={() => handleAddStudent(group)}
                       className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                     >
                       <UserPlus className="w-4 h-4 ml-1" />
                       إضافة طالب
                     </button>
                     <button 
                       onClick={() => handleViewGroup(group)}
                       className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                     >
                       عرض التفاصيل
                     </button>
                   </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة المجموعات</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم المجموعة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الطلاب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المعلم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => {
                const capacityPercentage = getCapacityPercentage(group.current_students, group.max_students)
                return (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {group.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {group.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.current_students}/{group.max_students}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCapacityColor(capacityPercentage)}`}>
                        {capacityPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.teacher_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.created_at ? new Date(group.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                             <div className="flex items-center space-x-2 space-x-reverse">
                         <button 
                           onClick={() => handleViewGroup(group)}
                           className="text-blue-600 hover:text-blue-900 flex items-center"
                         >
                           <Eye className="w-4 h-4 ml-1" />
                           عرض
                         </button>
                         <button 
                           onClick={() => handleEditGroup(group)}
                           className="text-green-600 hover:text-green-900 flex items-center"
                         >
                           <Edit className="w-4 h-4 ml-1" />
                           تعديل
                         </button>
                         <button 
                           onClick={() => handleDeleteGroup(group.id)}
                           className="text-red-600 hover:text-red-900 flex items-center"
                         >
                           <Trash2 className="w-4 h-4 ml-1" />
                           حذف
                         </button>
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مجموعات</h3>
            <p className="mt-1 text-sm text-gray-500">
              لم يتم إنشاء أي مجموعات بعد.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              إنشاء مجموعة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">إنشاء مجموعة جديدة</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateGroup(); }} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  اسم المجموعة *
                </label>
                <input
                  type="text"
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="اسم المجموعة"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  الوصف (اختياري)
                </label>
                <textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="وصف المجموعة"
                />
              </div>

              <div>
                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                  العدد الأقصى للطلاب *
                </label>
                <input
                  type="number"
                  id="max_students"
                  value={createForm.max_students}
                  onChange={(e) => setCreateForm({ ...createForm, max_students: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div>
                <label htmlFor="level_stage_id" className="block text-sm font-medium text-gray-700">
                  المرحلة (اختياري)
                </label>
                <select
                  id="level_stage_id"
                  value={createForm.level_stage_id}
                  onChange={(e) => setCreateForm({ ...createForm, level_stage_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">اختر المرحلة</option>
                  {stages.map((stage: any) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  إنشاء المجموعة
                </button>
              </div>
            </form>
                     </div>
         </div>
       )}

       {/* View Group Modal */}
       {showViewModal && selectedGroup && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold">تفاصيل المجموعة: {selectedGroup.name}</h2>
               <button
                 onClick={() => setShowViewModal(false)}
                 className="text-gray-500 hover:text-gray-700"
               >
                 ✕
               </button>
             </div>
             
             <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">اسم المجموعة</label>
                   <p className="text-lg font-semibold text-gray-900">{selectedGroup.name}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                   <p className="text-gray-900">{selectedGroup.description || 'لا يوجد وصف'}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">عدد الطلاب</label>
                   <p className="text-lg font-semibold text-gray-900">
                     {selectedGroup.current_students}/{selectedGroup.max_students}
                   </p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإنشاء</label>
                   <p className="text-gray-900">
                     {selectedGroup.created_at ? new Date(selectedGroup.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                   </p>
                 </div>
               </div>

               <div>
                 <h3 className="text-lg font-semibold mb-4">طلاب المجموعة</h3>
                 {groupStudents.length === 0 ? (
                   <p className="text-gray-500">لا يوجد طلاب في هذه المجموعة</p>
                 ) : (
                   <div className="space-y-2">
                                           {groupStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{student.name || student.email}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <p className="text-sm text-gray-600">انضم في {student.joined_at ? new Date(student.joined_at).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(selectedGroup.id, student.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            إزالة
                          </button>
                        </div>
                      ))}
                   </div>
                 )}
               </div>

               <div className="flex justify-end gap-3">
                 <button
                   onClick={() => handleAddStudent(selectedGroup)}
                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                 >
                   إضافة طالب
                 </button>
                 <button
                   onClick={() => setShowViewModal(false)}
                   className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                 >
                   إغلاق
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Edit Group Modal */}
       {showEditModal && selectedGroup && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
             <h3 className="text-lg font-semibold mb-4">تعديل المجموعة</h3>
             <form onSubmit={(e) => { e.preventDefault(); handleUpdateGroup(); }} className="space-y-4">
               <div>
                 <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                   اسم المجموعة *
                 </label>
                 <input
                   type="text"
                   id="edit-name"
                   value={editForm.name}
                   onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                   placeholder="اسم المجموعة"
                   required
                 />
               </div>

               <div>
                 <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                   الوصف (اختياري)
                 </label>
                 <textarea
                   id="edit-description"
                   value={editForm.description}
                   onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                   rows={3}
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                   placeholder="وصف المجموعة"
                 />
               </div>

               <div>
                 <label htmlFor="edit-max_students" className="block text-sm font-medium text-gray-700">
                   العدد الأقصى للطلاب *
                 </label>
                 <input
                   type="number"
                   id="edit-max_students"
                   value={editForm.max_students}
                   onChange={(e) => setEditForm({ ...editForm, max_students: parseInt(e.target.value) })}
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                   min="1"
                   max="50"
                   required
                 />
               </div>

               <div className="flex justify-end space-x-2 space-x-reverse">
                 <button
                   type="button"
                   onClick={() => setShowEditModal(false)}
                   className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                 >
                   إلغاء
                 </button>
                 <button
                   type="submit"
                   className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                 >
                   تحديث المجموعة
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Add Student Modal */}
       {showAddStudentModal && selectedGroup && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
             <h3 className="text-lg font-semibold mb-4">إضافة طالب للمجموعة: {selectedGroup.name}</h3>
             <form onSubmit={(e) => { e.preventDefault(); handleAddStudentToGroup(); }} className="space-y-4">
                               <div>
                  <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                    اختر الطالب *
                  </label>
                  {students.length === 0 ? (
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        فشل في تحميل قائمة الطلاب. يرجى إعادة تحميل الصفحة.
                      </p>
                    </div>
                  ) : students.filter(student => !groupStudents.some(groupStudent => groupStudent.id === student.id)).length === 0 ? (
                    <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        لا يوجد طلاب متاحين للإضافة. جميع الطلاب موجودون بالفعل في هذه المجموعة.
                      </p>
                    </div>
                  ) : (
                    <select
                      id="student_id"
                      value={addStudentForm.student_id}
                      onChange={(e) => setAddStudentForm({ ...addStudentForm, student_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      required
                    >
                      <option value="">اختر الطالب...</option>
                      {students
                        .filter(student => !groupStudents.some(groupStudent => groupStudent.id === student.id))
                        .map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name || student.email}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                               <div className="flex justify-end space-x-2 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={students.length === 0 || students.filter(student => !groupStudents.some(groupStudent => groupStudent.id === student.id)).length === 0}
                    className={`px-4 py-2 rounded-lg ${
                      students.length === 0 || students.filter(student => !groupStudents.some(groupStudent => groupStudent.id === student.id)).length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    إضافة الطالب
                  </button>
                </div>
             </form>
           </div>
         </div>
       )}
     </div>
   )
 }
