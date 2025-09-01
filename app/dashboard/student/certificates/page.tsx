'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { GraduationCap, Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Certificate {
  id: string
  serialNumber: number
  grade: string
  issueDate: string
  status: string
  createdAt: string
  teacherEmail: string
  stageName: string
}

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/student/certificates')
      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates || [])
      } else {
        toast.error('فشل في تحميل الشهادات')
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('حدث خطأ في تحميل الشهادات')
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = async (certificateId: string) => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificate-${certificateId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('تم تحميل الشهادة بنجاح')
      } else {
        toast.error('فشل في تحميل الشهادة')
      }
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast.error('حدث خطأ في تحميل الشهادة')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'معتمدة'
      case 'PENDING':
        return 'قيد المراجعة'
      case 'REJECTED':
        return 'مرفوضة'
      default:
        return 'غير معروف'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">الشهادات</h1>
            <p className="text-muted">عرض الشهادات المعتمدة</p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">الشهادات</h1>
          <p className="text-muted">عرض الشهادات المعتمدة</p>
        </div>

        {certificates.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد شهادات</h2>
              <p className="text-muted">لم يتم إصدار أي شهادات لك بعد</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <GraduationCap className="w-6 h-6 text-primary ml-2" />
                    <h3 className="text-lg font-bold">{certificate.stageName}</h3>
                  </div>
                  <div className={`badge ${getStatusColor(certificate.status)}`}>
                    {getStatusIcon(certificate.status)}
                    <span className="mr-1">{getStatusText(certificate.status)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">المرحلة:</span> {certificate.stageName}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">المعلم:</span> {certificate.teacherEmail}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">تاريخ الإصدار:</span>{' '}
                    {new Date(certificate.issueDate).toLocaleDateString('ar-SA')}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">الرقم التسلسلي:</span> {certificate.serialNumber}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">الدرجة:</span> {certificate.grade}
                  </div>
                </div>

                {certificate.status === 'APPROVED' && (
                  <button
                    onClick={() => downloadCertificate(certificate.id)}
                    className="btn-primary w-full inline-flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل الشهادة
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
