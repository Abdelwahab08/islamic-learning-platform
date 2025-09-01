'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  Download,
  Eye,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Certificate {
  id: string
  serial: string
  student_name: string
  teacher_name: string
  stage_name: string
  grade: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  issued_at: string
}

interface CertificateDetails {
  id: string
  serial: string
  student_name: string
  teacher_name: string
  stage_name: string
  grade: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  issued_at: string
  approved_at?: string
  pdf_url?: string
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates')
      if (response.ok) {
        const data = await response.json()
        setCertificates(data)
      } else {
        toast.error('فشل في تحميل الشهادات')
      }
    } catch (error) {
      toast.error('فشل في تحميل الشهادات')
    } finally {
      setLoading(false)
    }
  }

  const approveCertificate = async (certificateId: string) => {
    try {
      const response = await fetch(`/api/certificates/${certificateId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('تم الموافقة على الشهادة بنجاح')
        fetchCertificates()
      } else {
        toast.error('فشل في الموافقة على الشهادة')
      }
    } catch (error) {
      toast.error('فشل في الموافقة على الشهادة')
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
        a.download = `certificate-${certificateId}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('تم تحميل الشهادة بنجاح')
      } else {
        toast.error('فشل في تحميل الشهادة')
      }
    } catch (error) {
      toast.error('فشل في تحميل الشهادة')
    }
  }

  const viewCertificateDetails = async (certificateId: string) => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`/api/certificates/${certificateId}`)
      if (response.ok) {
        const details = await response.json()
        setSelectedCertificate(details)
        setShowDetailsModal(true)
      } else {
        toast.error('فشل في تحميل تفاصيل الشهادة')
      }
    } catch (error) {
      toast.error('فشل في تحميل تفاصيل الشهادة')
    } finally {
      setLoadingDetails(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">موافق عليها</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">في الانتظار</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">مرفوضة</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">غير معروف</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الشهادات</h1>
        <p className="text-gray-600">مراجعة والموافقة على شهادات الطلاب</p>
      </div>

      <div className="grid gap-6">
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد شهادات للعرض</p>
            </CardContent>
          </Card>
        ) : (
          certificates.map((certificate) => (
            <Card key={certificate.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-blue-500 ml-2" />
                    <CardTitle className="text-lg">شهادة رقم {certificate.serial}</CardTitle>
                  </div>
                  {getStatusBadge(certificate.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">الطالب:</span>
                      <span className="mr-2">{certificate.student_name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">المعلم:</span>
                      <span className="mr-2">{certificate.teacher_name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">المرحلة:</span>
                      <span className="mr-2">{certificate.stage_name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">تاريخ الإصدار:</span>
                      <span className="mr-2">{formatDate(certificate.issued_at)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">الدرجة:</span>
                      <span className="mr-2">{certificate.grade}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {certificate.status === 'PENDING' && (
                    <Button
                      onClick={() => approveCertificate(certificate.id)}
                      className="btn-primary"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      موافقة
                    </Button>
                  )}
                  
                  {certificate.status === 'APPROVED' && (
                    <Button
                      onClick={() => downloadCertificate(certificate.id)}
                      className="btn-secondary"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="btn-outline"
                    onClick={() => viewCertificateDetails(certificate.id)}
                    disabled={loadingDetails}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    {loadingDetails ? 'جاري التحميل...' : 'عرض التفاصيل'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Certificate Details Modal */}
      {showDetailsModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">تفاصيل الشهادة</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">رقم الشهادة:</span>
                    <span className="mr-2">{selectedCertificate.serial}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">الطالب:</span>
                    <span className="mr-2">{selectedCertificate.student_name}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">المعلم:</span>
                    <span className="mr-2">{selectedCertificate.teacher_name}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">المرحلة:</span>
                    <span className="mr-2">{selectedCertificate.stage_name}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">الدرجة:</span>
                    <span className="mr-2">{selectedCertificate.grade}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">الحالة:</span>
                    <span className="mr-2">{getStatusBadge(selectedCertificate.status)}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                    <span className="font-medium">تاريخ الإصدار:</span>
                    <span className="mr-2">{formatDate(selectedCertificate.issued_at)}</span>
                  </div>
                  {selectedCertificate.approved_at && (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-gray-500 ml-2" />
                      <span className="font-medium">تاريخ الموافقة:</span>
                      <span className="mr-2">{formatDate(selectedCertificate.approved_at)}</span>
                    </div>
                  )}
                </div>
              </div>



              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedCertificate.status === 'PENDING' && (
                  <Button
                    onClick={() => {
                      approveCertificate(selectedCertificate.id)
                      setShowDetailsModal(false)
                    }}
                    className="btn-primary"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    موافقة
                  </Button>
                )}
                
                {selectedCertificate.status === 'APPROVED' && selectedCertificate.pdf_url && (
                  <Button
                    onClick={() => {
                      downloadCertificate(selectedCertificate.id)
                      setShowDetailsModal(false)
                    }}
                    className="btn-secondary"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل الشهادة
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
