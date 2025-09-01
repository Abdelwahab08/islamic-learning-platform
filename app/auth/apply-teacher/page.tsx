'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowLeft, User, Phone, FileText, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApplyTeacherPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    bio: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error('يرجى اختيار ملف PDF أو صورة (JPG/PNG)')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
        return
      }
      
      setCvFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة')
      return
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (!acceptedTerms) {
      toast.error('يجب الموافقة على شروط وأحكام المنصة')
      return
    }

    setLoading(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('fullName', formData.fullName)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
      submitData.append('phoneNumber', formData.phoneNumber)
      submitData.append('bio', formData.bio)
      
      if (cvFile) {
        submitData.append('cvFile', cvFile)
      }

      const response = await fetch('/api/auth/apply-teacher', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('تم تقديم طلبك بنجاح! سيتم مراجعة طلبك قريباً')
        router.push('/auth/awaiting-approval?type=teacher')
      } else {
        toast.error(data.message || 'حدث خطأ في تقديم الطلب')
      }
    } catch (error) {
      console.error('Teacher application error:', error)
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

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
          <h2 className="text-3xl font-bold text-primary">منصه يقين</h2>
          <p className="mt-2 text-muted">تقديم طلب للانضمام كمعلم في المنصة</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="form-label">
                الاسم الكامل *
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="form-label">
                رقم الهاتف (اختياري)
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                كلمة المرور *
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                تأكيد كلمة المرور *
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="أعد إدخال كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Bio/Experience */}
            <div>
              <label htmlFor="bio" className="form-label">
                السيرة الذاتية والخبرة (اختياري)
              </label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-input pr-10 resize-none"
                  placeholder="أدخل خبرتك التعليمية، الشهادات، الإجازات، سنوات التدريس، إلخ..."
                />
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <label htmlFor="cvFile" className="form-label">
                رفع السيرة الذاتية أو الشهادة (اختياري)
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  id="cvFile"
                  name="cvFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-5 h-5 ml-2 text-gray-400" />
                  {cvFile ? cvFile.name : 'اختر ملف PDF أو صورة (JPG/PNG)'}
                </button>
                {cvFile && (
                  <p className="text-sm text-green-600 mt-1">تم اختيار الملف: {cvFile.name}</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
              </div>
              <div className="mr-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  أوافق على{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    شروط وأحكام المنصة
                  </Link>
                  {' '}و{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    سياسة الخصوصية
                  </Link>
                  *
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full flex items-center justify-center"
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 ml-2" />
                    تقديم طلب معلم
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted">
              لديك حساب بالفعل؟{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </p>
            <p className="text-muted mt-2">
              أو{' '}
              <Link href="/auth/register-student" className="text-primary hover:underline">
                سجل كطالب جديد
              </Link>
            </p>
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
