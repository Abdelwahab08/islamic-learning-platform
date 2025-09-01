'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, Users, Video, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  max_participants: number
  current_participants: number
  meeting_type: string
  status: string
}

export default function TeacherMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    meeting_type: 'AGORA',
    group_id: '',
    stage_id: ''
  })
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    meeting_type: 'AGORA',
    group_id: '',
    stage_id: ''
  })
  const [groups, setGroups] = useState<any[]>([])
  const [stages, setStages] = useState<any[]>([])

  useEffect(() => {
    fetchMeetings()
    fetchGroups()
    fetchStages()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/teacher/meetings')
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      } else {
        toast.error('فشل في تحميل الاجتماعات')
        setMeetings([])
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error('حدث خطأ في تحميل الاجتماعات')
      setMeetings([])
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreateMeeting = async () => {
    if (!createForm.title || !createForm.date || !createForm.time || !createForm.duration) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/teacher/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم إنشاء الاجتماع بنجاح')
        setShowCreateModal(false)
        setCreateForm({
          title: '',
          description: '',
          date: '',
          time: '',
          duration: 60,
          meeting_type: 'AGORA',
          group_id: '',
          stage_id: ''
        })
        fetchMeetings() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إنشاء الاجتماع')
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      toast.error('حدث خطأ في إنشاء الاجتماع')
    }
  }

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setEditForm({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date.split('T')[0],
      time: meeting.time,
      duration: meeting.duration,
      meeting_type: meeting.meeting_type,
      group_id: '',
      stage_id: ''
    })
    setShowEditModal(true)
  }

  const handleUpdateMeeting = async () => {
    if (!selectedMeeting || !editForm.title || !editForm.date || !editForm.time || !editForm.duration) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch(`/api/teacher/meetings/${selectedMeeting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        toast.success('تم تحديث الاجتماع بنجاح')
        setShowEditModal(false)
        setSelectedMeeting(null)
        fetchMeetings() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في تحديث الاجتماع')
      }
    } catch (error) {
      console.error('Error updating meeting:', error)
      toast.error('حدث خطأ في تحديث الاجتماع')
    }
  }

  const handleStartMeeting = async (meetingId: string) => {
    try {
      const response = await fetch(`/api/teacher/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' })
      })

      if (response.ok) {
        toast.success('تم بدء الاجتماع بنجاح')
        fetchMeetings() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في بدء الاجتماع')
      }
    } catch (error) {
      console.error('Error starting meeting:', error)
      toast.error('حدث خطأ في بدء الاجتماع')
    }
  }

  const handleCancelMeeting = async (meetingId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الاجتماع؟')) {
      return
    }

    try {
      const response = await fetch(`/api/teacher/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel' })
      })

      if (response.ok) {
        toast.success('تم إلغاء الاجتماع بنجاح')
        fetchMeetings() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إلغاء الاجتماع')
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error)
      toast.error('حدث خطأ في إلغاء الاجتماع')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100'
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'completed':
        return 'text-gray-600 bg-gray-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدول'
      case 'active':
        return 'جاري'
      case 'completed':
        return 'مكتمل'
      case 'cancelled':
        return 'ملغي'
      default:
        return 'غير معروف'
    }
  }

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'ONLINE':
        return <Video className="w-4 h-4" />
      case 'OFFLINE':
        return <MapPin className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getMeetingTypeText = (type: string) => {
    switch (type) {
      case 'ONLINE':
        return 'عبر الإنترنت'
      case 'OFFLINE':
        return 'حضوري'
      default:
        return 'غير محدد'
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
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">الاجتماعات</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center"
        >
          <Plus className="w-4 h-4 ml-2" />
          إنشاء اجتماع جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الاجتماعات</p>
              <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">مجدول</p>
                             <p className="text-2xl font-bold text-gray-900">
                 {meetings.filter(m => m.status === 'scheduled').length}
               </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Video className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">جاري</p>
                             <p className="text-2xl font-bold text-gray-900">
                 {meetings.filter(m => m.status === 'active').length}
               </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">مكتمل</p>
                             <p className="text-2xl font-bold text-gray-900">
                 {meetings.filter(m => m.status === 'completed').length}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة الاجتماعات</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ والوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المشاركون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {meeting.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {meeting.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(meeting.date).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {meeting.time} ({meeting.duration} دقيقة)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMeetingTypeIcon(meeting.meeting_type)}
                      <span className="mr-2 text-sm text-gray-900">
                        {getMeetingTypeText(meeting.meeting_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {meeting.current_participants}/{meeting.max_participants}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {getStatusText(meeting.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleEditMeeting(meeting)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleStartMeeting(meeting.id)}
                        className="text-green-600 hover:text-green-900"
                        disabled={meeting.status === 'cancelled' || meeting.status === 'completed'}
                      >
                        بدء
                      </button>
                      <button 
                        onClick={() => handleCancelMeeting(meeting.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={meeting.status === 'cancelled' || meeting.status === 'completed'}
                      >
                        إلغاء
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meetings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد اجتماعات</h3>
            <p className="mt-1 text-sm text-gray-500">
              لم يتم إنشاء أي اجتماعات بعد.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              إنشاء اجتماع جديد
            </button>
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">إنشاء اجتماع جديد</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateMeeting(); }} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  عنوان الاجتماع
                </label>
                <input
                  type="text"
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="عنوان الاجتماع"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  الوصف
                </label>
                <textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="وصف الاجتماع"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                    الوقت
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={createForm.time}
                    onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  المدة (دقائق)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({ ...createForm, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  min="15"
                  max="180"
                  required
                />
              </div>

              <div>
                <label htmlFor="meeting_type" className="block text-sm font-medium text-gray-700">
                  نوع الاجتماع
                </label>
                <select
                  id="meeting_type"
                  value={createForm.meeting_type}
                  onChange={(e) => setCreateForm({ ...createForm, meeting_type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="AGORA">Agora</option>
                  <option value="ZOOM">Zoom</option>
                  <option value="MEET">Google Meet</option>
                  <option value="JITSI">Jitsi</option>
                </select>
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

              <div>
                <label htmlFor="stage_id" className="block text-sm font-medium text-gray-700">
                  المرحلة (اختياري)
                </label>
                <select
                  id="stage_id"
                  value={createForm.stage_id}
                  onChange={(e) => setCreateForm({ ...createForm, stage_id: e.target.value })}
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
                  إنشاء الاجتماع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {showEditModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">تعديل الاجتماع</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateMeeting(); }} className="space-y-4">
              <div>
                <label htmlFor="edit_title" className="block text-sm font-medium text-gray-700">
                  عنوان الاجتماع
                </label>
                <input
                  type="text"
                  id="edit_title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="عنوان الاجتماع"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700">
                  الوصف
                </label>
                <textarea
                  id="edit_description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="وصف الاجتماع"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit_date" className="block text-sm font-medium text-gray-700">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    id="edit_date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="edit_time" className="block text-sm font-medium text-gray-700">
                    الوقت
                  </label>
                  <input
                    type="time"
                    id="edit_time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit_duration" className="block text-sm font-medium text-gray-700">
                  المدة (دقائق)
                </label>
                <input
                  type="number"
                  id="edit_duration"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  min="15"
                  max="180"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit_meeting_type" className="block text-sm font-medium text-gray-700">
                  نوع الاجتماع
                </label>
                <select
                  id="edit_meeting_type"
                  value={editForm.meeting_type}
                  onChange={(e) => setEditForm({ ...editForm, meeting_type: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="AGORA">Agora</option>
                  <option value="ZOOM">Zoom</option>
                  <option value="MEET">Google Meet</option>
                  <option value="JITSI">Jitsi</option>
                </select>
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

              <div>
                <label htmlFor="edit_stage_id" className="block text-sm font-medium text-gray-700">
                  المرحلة (اختياري)
                </label>
                <select
                  id="edit_stage_id"
                  value={editForm.stage_id}
                  onChange={(e) => setEditForm({ ...editForm, stage_id: e.target.value })}
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
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMeeting(null)
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  تحديث الاجتماع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
