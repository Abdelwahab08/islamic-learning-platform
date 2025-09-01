'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AwaitingApprovalPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')

  const getContent = () => {
    switch (type) {
      case 'teacher':
        return {
          title: 'طلبك قيد المراجعة',
          description: 'تم تقديم طلبك للانضمام كمعلم في المنصة. سيتم مراجعة طلبك من قبل الإدارة وسيتم إعلامك بالنتيجة قريباً.',
          icon: <Clock className="w-16 h-16 text-yellow-500" />,
          status: 'pending',
        }
      case 'student':
        return {
          title: 'حسابك قيد المراجعة',
          description: 'تم تسجيل حسابك كطالب في المنصة. سيتم مراجعة طلبك من قبل الإدارة وسيتم إعلامك بالنتيجة قريباً.',
          icon: <Clock className="w-16 h-16 text-yellow-500" />,
          status: 'pending',
        }
      default:
        return {
          title: 'طلب قيد المراجعة',
          description: 'طلبك قيد المراجعة من قبل الإدارة. سيتم إعلامك بالنتيجة قريباً.',
          icon: <Clock className="w-16 h-16 text-yellow-500" />,
          status: 'pending',
        }
    }
  }

  const content = getContent()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.jpg" 
              alt="منصة التعلم الإسلامي" 
              className="w-16 h-16 rounded-full shadow-md"
            />
          </div>
          <div className="flex justify-center mb-6">
            {content.icon}
          </div>
                     <h2 className="text-3xl font-bold text-primary mb-4">منصه يقين</h2>
          <p className="text-muted leading-relaxed">{content.description}</p>
        </div>

        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center text-muted">
              <CheckCircle className="w-5 h-5 ml-2 text-green-500" />
              <span>تم استلام طلبك بنجاح</span>
            </div>
            <div className="flex items-center text-muted">
              <Clock className="w-5 h-5 ml-2 text-yellow-500" />
              <span>قيد المراجعة من قبل الإدارة</span>
            </div>
            <div className="flex items-center text-muted">
              <AlertCircle className="w-5 h-5 ml-2 text-blue-500" />
              <span>سيتم إعلامك بالنتيجة عبر البريد الإلكتروني</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted">
                يمكنك العودة للصفحة الرئيسية أو تسجيل الدخول لاحقاً
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  العودة للصفحة الرئيسية
                </Link>
                
                <Link
                  href="/auth/login"
                  className="btn-outline w-full flex items-center justify-center"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-muted hover:text-primary inline-flex items-center">
            <ArrowLeft className="w-4 h-4 ml-1" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
