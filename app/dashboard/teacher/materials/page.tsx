'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Plus, Download, FileText, Video, Image } from 'lucide-react'
import toast from 'react-hot-toast'

interface Material {
  id: string
  title: string
  description: string
  kind: string
  file_url?: string
  file_path: string
  file_size: number
  downloads_count: number
  created_at: string
  group_name: string
  stage_name: string
}

export default function TeacherMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    kind: 'PDF',
    file: null as File | null,
    group_id: '',
    stage_id: ''
  })
  const [groups, setGroups] = useState<any[]>([])
  const [stages, setStages] = useState<any[]>([])

  useEffect(() => {
    fetchMaterials()
    fetchGroups()
    fetchStages()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/teacher/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data.materials || [])
      } else {
        toast.error('فشل في تحميل المواد التعليمية')
        setMaterials([])
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
      toast.error('حدث خطأ في تحميل المواد التعليمية')
      setMaterials([])
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

  const handleCreateMaterial = async () => {
    if (!createForm.title || !createForm.file || !createForm.group_id) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      const formData = new FormData()
      formData.append('title', createForm.title)
      formData.append('description', createForm.description)
      formData.append('kind', createForm.kind)
      formData.append('file', createForm.file)
      formData.append('group_id', createForm.group_id)
      formData.append('stage_id', createForm.stage_id)

      const response = await fetch('/api/teacher/materials', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم إضافة المادة التعليمية بنجاح')
        setShowCreateModal(false)
        setCreateForm({ 
          title: '', 
          description: '', 
          kind: 'PDF', 
          file: null,
          group_id: '',
          stage_id: ''
        })
        fetchMaterials() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إضافة المادة التعليمية')
      }
    } catch (error) {
      console.error('Error creating material:', error)
      toast.error('حدث خطأ في إضافة المادة التعليمية')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCreateForm({ ...createForm, file })
    }
  }

  const getMaterialTypeIcon = (kind: string) => {
    switch (kind) {
      case 'PDF':
        return <FileText className="w-4 h-4" />
      case 'VIDEO':
        return <Video className="w-4 h-4" />
      case 'IMAGE':
        return <Image className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getMaterialTypeText = (kind: string) => {
    switch (kind) {
      case 'PDF':
        return 'ملف PDF'
      case 'VIDEO':
        return 'فيديو'
      case 'IMAGE':
        return 'صورة'
      default:
        return 'ملف'
    }
  }

  const handleDownload = async (materialId: string) => {
    try {
      // Find the material to get its file URL
      const material = materials.find(m => m.id === materialId)
      if (!material) {
        toast.error('المادة غير موجودة')
        return
      }

      // Extract filename from file_url
      const filename = material.file_url?.split('/').pop()
      if (!filename) {
        toast.error('رابط الملف غير صحيح')
        return
      }

      // Open file in new tab
      window.open(`/api/materials/file/${filename}`, '_blank')
      toast.success('تم فتح الملف بنجاح')
    } catch (error) {
      console.error('Error downloading material:', error)
      toast.error('حدث خطأ في تحميل المادة')
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
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">المواد التعليمية</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مادة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي المواد</p>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">ملفات PDF</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter(m => m.kind === 'PDF').length}
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
              <p className="text-sm font-medium text-gray-600">فيديوهات</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter(m => m.kind === 'VIDEO').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Image className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">صور</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter(m => m.kind === 'IMAGE').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة المواد التعليمية</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المادة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المجموعة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المرحلة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {material.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {material.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMaterialTypeIcon(material.kind)}
                      <span className="mr-2 text-sm text-gray-900">
                        {getMaterialTypeText(material.kind)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {material.group_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {material.stage_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(material.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDownload(material.id)}
                      className="text-primary hover:text-primary/80 flex items-center"
                    >
                      <Download className="w-4 h-4 ml-1" />
                      تحميل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {materials.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مواد تعليمية</h3>
            <p className="mt-1 text-sm text-gray-500">
              لم يتم إضافة أي مواد تعليمية بعد.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              إضافة مادة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Create Material Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">إضافة مادة تعليمية جديدة</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateMaterial(); }} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  العنوان
                </label>
                <input
                  type="text"
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="عنوان المادة"
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
                  placeholder="وصف المادة"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="kind" className="block text-sm font-medium text-gray-700">
                  نوع المادة
                </label>
                <select
                  id="kind"
                  value={createForm.kind}
                  onChange={(e) => setCreateForm({ ...createForm, kind: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="PDF">ملف PDF</option>
                  <option value="VIDEO">فيديو</option>
                  <option value="IMAGE">صورة</option>
                </select>
              </div>

              <div>
                <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
                  المجموعة *
                </label>
                <select
                  id="group_id"
                  value={createForm.group_id}
                  onChange={(e) => setCreateForm({ ...createForm, group_id: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  required
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

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  الملف
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf,video/*,image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  required
                />
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
                  حفظ المادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
