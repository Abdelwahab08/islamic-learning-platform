'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Video, 
  Headphones, 
  File, 
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  Search,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Material {
  id: string
  title: string
  kind: string
  teacher_name: string
  stage_name: string
  created_at: string
  file_url: string
}

export default function AdminContentPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)

  // Some records store a single file path string (e.g. "/uploads/file.pdf"),
  // while others may store a JSON array string. This safely returns a count.
  const getFileCount = (fileUrl: string | null | undefined) => {
    if (!fileUrl) return 0
    const trimmed = String(fileUrl).trim()
    if (trimmed.startsWith('[')) {
      try {
        const arr = JSON.parse(trimmed)
        return Array.isArray(arr) ? arr.length : 1
      } catch {
        return 1
      }
    }
    return 1
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      // Add cache-busting parameter to force fresh request
      const response = await fetch(`${window.location.origin}/api/materials?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          setMaterials(data)
        } else {
          console.error('Response is not JSON:', contentType)
          toast.error('فشل في تحميل المحتوى التعليمي - استجابة غير صحيحة')
        }
      } else {
        console.error('API response not ok:', response.status, response.statusText)
        toast.error('فشل في تحميل المحتوى التعليمي')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('فشل في تحميل المحتوى التعليمي')
    } finally {
      setLoading(false)
    }
  }

  const deleteMaterial = async (materialId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return

    try {
      const response = await fetch(`${window.location.origin}/api/materials/${materialId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('تم حذف المحتوى بنجاح')
        fetchMaterials()
      } else {
        toast.error('فشل في حذف المحتوى')
      }
    } catch (error) {
      toast.error('فشل في حذف المحتوى')
    }
  }

  const downloadMaterial = async (material: Material) => {
    try {
      const response = await fetch(`${window.location.origin}/api/materials/${material.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = material.title
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('تم تحميل المحتوى بنجاح')
      } else {
        toast.error('فشل في تحميل المحتوى')
      }
    } catch (error) {
      toast.error('فشل في تحميل المحتوى')
    }
  }

  const viewMaterial = (material: Material) => {
    setSelectedMaterial(material)
    setShowViewModal(true)
  }

  const editMaterial = (material: Material) => {
    setEditingMaterial(material)
    setShowEditModal(true)
  }

  const updateMaterial = async () => {
    if (!editingMaterial) return

    try {
      const response = await fetch(`${window.location.origin}/api/materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingMaterial)
      })
      
      if (response.ok) {
        toast.success('تم تحديث المحتوى بنجاح')
        setShowEditModal(false)
        setEditingMaterial(null)
        fetchMaterials()
      } else {
        toast.error('فشل في تحديث المحتوى')
      }
    } catch (error) {
      toast.error('فشل في تحديث المحتوى')
    }
  }

  const getFileIcon = (kind: string) => {
    if (kind === 'PDF') {
      return <FileText className="w-6 h-6 text-red-500" />
    } else if (kind === 'VIDEO') {
      return <Video className="w-6 h-6 text-blue-500" />
    } else if (kind === 'AUDIO') {
      return <Headphones className="w-6 h-6 text-green-500" />
    } else {
      return <File className="w-6 h-6 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.stage_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المحتوى التعليمي</h1>
            <p className="text-gray-600">إدارة المواد التعليمية والمحتوى</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            <Plus className="w-4 h-4 ml-2" />
            إضافة محتوى جديد
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="البحث في المحتوى..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إضافة محتوى جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="عنوان المحتوى" />
              <Input placeholder="نوع الملف" />
              <Textarea placeholder="وصف المحتوى" className="md:col-span-2" />
              <Button className="btn-primary">رفع الملف</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد محتويات للعرض'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMaterials.map((material) => (
            <Card key={material.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getFileIcon(material.kind)}
                    <CardTitle className="text-lg mr-2">{material.title}</CardTitle>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{material.kind}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">المعلم:</span>
                      <span className="mr-2">{material.teacher_name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">المرحلة:</span>
                      <span className="mr-2">{material.stage_name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">تاريخ الإضافة:</span>
                      <span className="mr-2">{formatDate(material.created_at)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">عدد الملفات:</span>
                      <span className="mr-2">
                        {getFileCount(material.file_url)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadMaterial(material)}
                    className="btn-secondary"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="btn-outline"
                    onClick={() => viewMaterial(material)}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    عرض
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="btn-outline"
                    onClick={() => editMaterial(material)}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  
                  <Button
                    onClick={() => deleteMaterial(material.id)}
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

      {/* View Material Modal */}
      {showViewModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">تفاصيل المحتوى</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowViewModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">العنوان:</span>
                    <span className="mr-2">{selectedMaterial.title}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">النوع:</span>
                    <span className="mr-2">{selectedMaterial.kind}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">المعلم:</span>
                    <span className="mr-2">{selectedMaterial.teacher_name}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">المرحلة:</span>
                    <span className="mr-2">{selectedMaterial.stage_name}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">تاريخ الإضافة:</span>
                    <span className="mr-2">{formatDate(selectedMaterial.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    downloadMaterial(selectedMaterial)
                    setShowViewModal(false)
                  }}
                  className="btn-secondary"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditModal && editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">تعديل المحتوى</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMaterial(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">العنوان</label>
                    <Input
                      value={editingMaterial.title}
                      onChange={(e) => setEditingMaterial({
                        ...editingMaterial,
                        title: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">النوع</label>
                    <Input
                      value={editingMaterial.kind}
                      onChange={(e) => setEditingMaterial({
                        ...editingMaterial,
                        kind: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={updateMaterial}
                  className="btn-primary"
                >
                  حفظ التغييرات
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingMaterial(null)
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
