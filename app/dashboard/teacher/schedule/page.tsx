'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScheduleItem {
  id: string
  day: string
  time: string
  subject: string
  group_id?: string
  group_name?: string
  duration: number
  room?: string
}

export default function TeacherSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<ScheduleItem | null>(null)
  const [createForm, setCreateForm] = useState({
    day_of_week: 'monday',
    start_time: '',
    subject: '',
    duration_minutes: 60,
    room: '',
    group_id: ''
  })
  const [editForm, setEditForm] = useState({
    day_of_week: 'monday',
    start_time: '',
    subject: '',
    duration_minutes: 60,
    room: '',
    group_id: ''
  })
  const [groups, setGroups] = useState<any[]>([])

  useEffect(() => {
    fetchSchedule()
    // Remove fetchGroups() since we'll get groups from the schedule API
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/teacher/lessons')
      if (response.ok) {
        const data = await response.json()
        console.log('Schedule data received:', data) // Debug log
        
        // Set both schedule and groups from the same API call
        setSchedule(data.schedule || [])
        setGroups(data.groups || [])
        
        // Show message if table doesn't exist
        if (data.message && data.message.includes('جدول الحصص غير موجود')) {
          toast.error('يجب إنشاء جدول الحصص أولاً. راجع الإدارة.')
        }
      } else {
        const errorData = await response.json()
        console.log('Schedule error:', errorData) // Debug log
        if (errorData.error && errorData.error.includes('جدول الحصص غير موجود')) {
          toast.error('يجب إنشاء جدول الحصص أولاً. راجع الإدارة.')
        } else {
          toast.error('فشل في تحميل الجدول الزمني')
        }
        setSchedule([])
        setGroups([])
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      toast.error('حدث خطأ في تحميل الجدول الزمني')
      setSchedule([])
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get group name from group ID
  const getGroupName = (groupId: string) => {
    if (!groupId) return 'غير محدد'
    const group = groups.find(g => g.id === groupId)
    return group ? group.name : `المجموعة ${groupId}`
  }

  // Remove the old fetchGroups function since we don't need it anymore

  const handleCreateLesson = async () => {
    if (!createForm.day_of_week || !createForm.start_time || !createForm.subject || !createForm.duration_minutes) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/teacher/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم إضافة الحصة بنجاح')
        setShowCreateModal(false)
        setCreateForm({
          day_of_week: 'monday',
          start_time: '',
          subject: '',
          duration_minutes: 60,
          room: '',
          group_id: ''
        })
        fetchSchedule() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إضافة الحصة')
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      toast.error('حدث خطأ في إضافة الحصة')
    }
  }

  const handleEditLesson = (lesson: ScheduleItem) => {
    setEditingLesson(lesson)
    setEditForm({
      day_of_week: lesson.day,
      start_time: lesson.time,
      subject: lesson.subject,
      duration_minutes: lesson.duration,
      room: lesson.room || '',
      group_id: lesson.group_id || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateLesson = async () => {
    if (!editingLesson || !editForm.day_of_week || !editForm.start_time || !editForm.subject || !editForm.duration_minutes) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/teacher/lessons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingLesson.id,
          ...editForm
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم تحديث الحصة بنجاح')
        setShowEditModal(false)
        setEditingLesson(null)
        fetchSchedule() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في تحديث الحصة')
      }
    } catch (error) {
      console.error('Error updating lesson:', error)
      toast.error('حدث خطأ في تحديث الحصة')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/lessons?id=${lessonId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم حذف الحصة بنجاح')
        fetchSchedule() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حذف الحصة')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.error('حدث خطأ في حذف الحصة')
    }
  }

  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      'monday': 'الاثنين',
      'tuesday': 'الثلاثاء',
      'wednesday': 'الأربعاء',
      'thursday': 'الخميس',
      'friday': 'الجمعة',
      'saturday': 'السبت',
      'sunday': 'الأحد'
    }
    return days[day] || day
  }

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      'monday': 'bg-blue-100 text-blue-800',
      'tuesday': 'bg-green-100 text-green-800',
      'wednesday': 'bg-yellow-100 text-yellow-800',
      'thursday': 'bg-purple-100 text-purple-800',
      'friday': 'bg-red-100 text-red-800',
      'saturday': 'bg-indigo-100 text-indigo-800',
      'sunday': 'bg-pink-100 text-pink-800'
    }
    return colors[day] || 'bg-gray-100 text-gray-800'
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
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">الجدول الزمني</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة حصة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الحصص</p>
              <p className="text-2xl font-bold text-gray-900">{schedule.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الساعات</p>
              <p className="text-2xl font-bold text-gray-900">
                {schedule.reduce((sum, item) => sum + item.duration, 0) / 60} ساعة
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
              <p className="text-sm font-medium text-gray-600">المجموعات</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(schedule.map(item => item.group_name)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">الجدول الأسبوعي</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
              const daySchedule = schedule.filter(item => item.day === day)
              return (
                <div key={day} className="space-y-3">
                  <div className={`text-center p-3 rounded-lg font-semibold ${getDayColor(day)}`}>
                    {getDayName(day)}
                  </div>
                  
                  {daySchedule.length > 0 ? (
                    daySchedule.map((item) => (
                      <div key={item.id} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="text-sm font-medium text-gray-900">
                          {item.subject}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.time} - {item.duration} دقيقة
                        </div>
                        <div className="text-xs text-gray-600">
                          {getGroupName(item.group_id)}
                        </div>
                        {item.room && (
                          <div className="text-xs text-gray-600">
                            الغرفة: {item.room}
                          </div>
                        )}
                        <div className="flex items-center justify-end mt-2 space-x-1 space-x-reverse">
                          <button 
                            onClick={() => handleEditLesson(item)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLesson(item.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                      لا توجد حصص
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة الحصص</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اليوم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المادة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المجموعة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الغرفة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedule.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDayColor(item.day)}`}>
                      {getDayName(item.day)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getGroupName(item.group_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.duration} دقيقة
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.room || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleEditLesson(item)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(item.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedule.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد جدول زمني</h3>
            <p className="mt-1 text-sm text-gray-500">
              لم يتم إضافة أي حصص بعد.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              إضافة حصة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">إضافة حصة جديدة</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateLesson(); }} className="space-y-4">
              <div>
                <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700">
                  اليوم
                </label>
                <select
                  id="day_of_week"
                  value={createForm.day_of_week}
                  onChange={(e) => setCreateForm({ ...createForm, day_of_week: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                >
                  <option value="monday">الاثنين</option>
                  <option value="tuesday">الثلاثاء</option>
                  <option value="wednesday">الأربعاء</option>
                  <option value="thursday">الخميس</option>
                  <option value="friday">الجمعة</option>
                  <option value="saturday">السبت</option>
                  <option value="sunday">الأحد</option>
                </select>
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                  وقت البدء
                </label>
                <input
                  type="time"
                  id="start_time"
                  value={createForm.start_time}
                  onChange={(e) => setCreateForm({ ...createForm, start_time: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  المادة
                </label>
                <input
                  type="text"
                  id="subject"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="اسم المادة"
                  required
                />
              </div>

              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700">
                  المدة (دقائق)
                </label>
                <input
                  type="number"
                  id="duration_minutes"
                  value={createForm.duration_minutes}
                  onChange={(e) => setCreateForm({ ...createForm, duration_minutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  min="15"
                  max="180"
                  required
                />
              </div>

              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                  الغرفة (اختياري)
                </label>
                <input
                  type="text"
                  id="room"
                  value={createForm.room}
                  onChange={(e) => setCreateForm({ ...createForm, room: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="رقم الغرفة"
                />
              </div>

              <div>
                <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
                  المجموعة (اختياري)
                </label>
                <select
                  id="group_id"
                  value={createForm.group_id}
                  onChange={(e) => setCreateForm({ ...createForm, group_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">اختر المجموعة</option>
                  {groups.map((group: any) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
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
                  إضافة الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && editingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">تعديل الحصة</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateLesson(); }} className="space-y-4">
              <div>
                <label htmlFor="edit_day_of_week" className="block text-sm font-medium text-gray-700">
                  اليوم
                </label>
                <select
                  id="edit_day_of_week"
                  value={editForm.day_of_week}
                  onChange={(e) => setEditForm({ ...editForm, day_of_week: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                >
                  <option value="monday">الاثنين</option>
                  <option value="tuesday">الثلاثاء</option>
                  <option value="wednesday">الأربعاء</option>
                  <option value="thursday">الخميس</option>
                  <option value="friday">الجمعة</option>
                  <option value="saturday">السبت</option>
                  <option value="sunday">الأحد</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit_start_time" className="block text-sm font-medium text-gray-700">
                  وقت البدء
                </label>
                <input
                  type="time"
                  id="edit_start_time"
                  value={editForm.start_time}
                  onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit_subject" className="block text-sm font-medium text-gray-700">
                  المادة
                </label>
                <input
                  type="text"
                  id="edit_subject"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="اسم المادة"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit_duration_minutes" className="block text-sm font-medium text-gray-700">
                  المدة (دقائق)
                </label>
                <input
                  type="number"
                  id="edit_duration_minutes"
                  value={editForm.duration_minutes}
                  onChange={(e) => setEditForm({ ...editForm, duration_minutes: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  min="15"
                  max="180"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit_room" className="block text-sm font-medium text-gray-700">
                  الغرفة (اختياري)
                </label>
                <input
                  type="text"
                  id="edit_room"
                  value={editForm.room}
                  onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="رقم الغرفة"
                />
              </div>

              <div>
                <label htmlFor="edit_group_id" className="block text-sm font-medium text-gray-700">
                  المجموعة (اختياري)
                </label>
                <select
                  id="edit_group_id"
                  value={editForm.group_id}
                  onChange={(e) => setEditForm({ ...editForm, group_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">اختر المجموعة</option>
                  {groups.map((group: any) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingLesson(null)
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  تحديث الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
