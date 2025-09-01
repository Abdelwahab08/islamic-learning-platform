'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { BookOpen, Download, FileText, Video, Headphones, File, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Material {
  id: string
  title: string
  fileUrl: string
  fileType: string
  createdAt: string
  teacherEmail: string
  stageName: string
}

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/student/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data.materials || [])
      } else {
        toast.error('فشل في تحميل المواد التعليمية')
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
      toast.error('حدث خطأ في تحميل المواد التعليمية')
    } finally {
      setLoading(false)
    }
  }

  const downloadMaterial = async (material: Material) => {
    try {
      const response = await fetch(`/api/materials/${material.id}/download`)
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
        toast.success('تم تحميل المادة بنجاح')
      } else {
        toast.error('فشل في تحميل المادة')
      }
    } catch (error) {
      console.error('Error downloading material:', error)
      toast.error('حدث خطأ في تحميل المادة')
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">المواد التعليمية</h1>
            <p className="text-muted">عرض المواد التعليمية المتاحة</p>
          </div>
          <div className="card">
            <div className="text-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-muted">جاري التحميل...</p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">المواد التعليمية</h1>
          <p className="text-muted">عرض المواد التعليمية المتاحة</p>
        </div>

        {materials.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد مواد تعليمية</h2>
              <p className="text-muted">لم يتم رفع أي مواد تعليمية لك بعد</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getFileIcon(material.fileType)}
                    <h3 className="text-lg font-bold mr-2">{material.title}</h3>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 text-gray-500 ml-2" />
                    <span>{material.teacherEmail}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                    <span>{formatDate(material.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <File className="w-4 h-4 text-gray-500 ml-2" />
                    <span>نوع الملف: {material.fileType}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 text-gray-500 ml-2" />
                    <span>المرحلة: {material.stageName}</span>
                  </div>
                </div>

                <button
                  onClick={() => downloadMaterial(material)}
                  className="btn-primary w-full inline-flex items-center justify-center"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل المادة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
