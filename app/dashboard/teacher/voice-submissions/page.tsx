'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import AudioPlayer from '@/components/AudioPlayer'
import { Play, Pause, Volume2, User, Clock, Star, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoiceSubmission {
  id: string
  student_id: string
  student_name: string
  student_email: string
  audio_url: string
  message: string
  submitted_at: string
  grade: string | null
  feedback: string
  page_number: number | null
  evaluation_grade: string | null
  current_page: number
  status: string
}

export default function VoiceSubmissionsPage() {
  const [submissions, setSubmissions] = useState<VoiceSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<VoiceSubmission | null>(null)
  const [grading, setGrading] = useState<string | null>(null)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [pageNumber, setPageNumber] = useState('')
  const [evaluationGrade, setEvaluationGrade] = useState('')
  const [showNextPage, setShowNextPage] = useState(false)
  const [nextPageNumber, setNextPageNumber] = useState('')
  const [nextPageEvaluation, setNextPageEvaluation] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/teacher/voice-submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      } else {
        toast.error('فشل في تحميل التسجيلات الصوتية')
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }



  const handleGrade = async (submission: VoiceSubmission) => {
    if (!grade || !evaluationGrade || !pageNumber) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setGrading(submission.id)
    try {
      const response = await fetch('/api/teacher/voice-submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: submission.id,
          student_id: submission.student_id,
          grade,
          feedback,
          page_number: parseInt(pageNumber),
          evaluation_grade: evaluationGrade
        }),
      })

             if (response.ok) {
         const result = await response.json()
         toast.success('تم تقييم التسجيل الصوتي بنجاح')
         
         // Show next page option if student progressed
         if (result.next_page && result.next_page > parseInt(pageNumber)) {
           setShowNextPage(true)
           setNextPageNumber(result.next_page.toString())
           setNextPageEvaluation(evaluationGrade) // Use same evaluation for next page
         } else {
           setSelectedSubmission(null)
           setGrade('')
           setFeedback('')
           setPageNumber('')
           setEvaluationGrade('')
           setShowNextPage(false)
           fetchSubmissions() // Refresh the list
         }
       } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في تقييم التسجيل الصوتي')
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      toast.error('حدث خطأ في تقييم التسجيل الصوتي')
         } finally {
       setGrading(null)
     }
   }

   const handleNextPageGrade = async (submission: VoiceSubmission) => {
     if (!nextPageEvaluation || !nextPageNumber) {
       toast.error('يرجى ملء جميع الحقول المطلوبة')
       return
     }

     setGrading(submission.id)
     try {
       const response = await fetch('/api/teacher/voice-submissions', {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           submission_id: submission.id,
           student_id: submission.student_id,
           grade: grade, // Keep same grade
           feedback: feedback, // Keep same feedback
           page_number: parseInt(nextPageNumber),
           evaluation_grade: nextPageEvaluation
         }),
       })

       if (response.ok) {
         toast.success('تم تسجيل الصفحة التالية بنجاح')
         setSelectedSubmission(null)
         setGrade('')
         setFeedback('')
         setPageNumber('')
         setEvaluationGrade('')
         setShowNextPage(false)
         setNextPageNumber('')
         setNextPageEvaluation('')
         fetchSubmissions() // Refresh the list
       } else {
         const error = await response.json()
         toast.error(error.error || 'فشل في تسجيل الصفحة التالية')
       }
     } catch (error) {
       console.error('Error grading next page:', error)
       toast.error('حدث خطأ في تسجيل الصفحة التالية')
     } finally {
       setGrading(null)
     }
   }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">التسجيلات الصوتية</h1>
            <p className="text-muted">عرض وتقييم التسجيلات الصوتية من الطلاب</p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">التسجيلات الصوتية</h1>
          <p className="text-muted">عرض وتقييم التسجيلات الصوتية من الطلاب</p>
        </div>

        {submissions.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">لا توجد تسجيلات صوتية</h2>
              <p className="text-muted">لم يتم إرسال أي تسجيلات صوتية من الطلاب بعد.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{submission.student_name}</h3>
                      <p className="text-sm text-gray-500">{submission.student_email}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3 ml-1" />
                        {formatDate(submission.submitted_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {submission.status === 'graded' && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        تم التقييم
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedSubmission(selectedSubmission?.id === submission.id ? null : submission)}
                      className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark transition-colors"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>

                {submission.message && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{submission.message}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                    <Volume2 className="w-4 h-4" />
                    <span>تسجيل صوتي:</span>
                  </div>
                  <AudioPlayer 
                    audioUrl={`/api/uploads/assignments/${submission.audio_url}`}
                    filename={submission.audio_url}
                    className="w-full"
                  />
                </div>

                {/* Grading Section */}
                {selectedSubmission?.id === submission.id && (
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold mb-4">تقييم التسجيل الصوتي</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الدرجة
                        </label>
                        <input
                          type="text"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          placeholder="مثال: 95"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          التقييم
                        </label>
                                                 <select
                           value={evaluationGrade}
                           onChange={(e) => setEvaluationGrade(e.target.value)}
                           className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                         >
                           <option value="">اختر التقييم</option>
                           <option value="متفوق">✅ متفوق</option>
                           <option value="ممتاز">🌟 ممتاز</option>
                           <option value="جيد">جيد</option>
                           <option value="إعادة">🔄 إعادة</option>
                           <option value="غياب">🚫 غياب</option>
                           <option value="إذن">🕒 إذن</option>
                         </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          رقم الصفحة
                        </label>
                        <input
                          type="number"
                          value={pageNumber}
                          onChange={(e) => setPageNumber(e.target.value)}
                          placeholder="مثال: 15"
                          min="1"
                          max="30"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الملاحظات
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="اكتب ملاحظاتك هنا..."
                        rows={3}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleGrade(submission)}
                        disabled={grading === submission.id}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
                      >
                        <Star className="w-4 h-4" />
                        <span>تقييم التسجيل</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Next Page Grading Section */}
                {showNextPage && selectedSubmission?.id === submission.id && (
                  <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-semibold mb-4 text-blue-800">تسجيل الصفحة التالية</h4>
                    <p className="text-sm text-blue-600 mb-4">
                      الطالب تقدم إلى الصفحة {nextPageNumber}. يمكنك تسجيل هذه الصفحة مباشرة.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">
                          رقم الصفحة
                        </label>
                        <input
                          type="number"
                          value={nextPageNumber}
                          onChange={(e) => setNextPageNumber(e.target.value)}
                          placeholder="مثال: 16"
                          min="1"
                          max="30"
                          className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">
                          التقييم
                        </label>
                        <select
                          value={nextPageEvaluation}
                          onChange={(e) => setNextPageEvaluation(e.target.value)}
                          className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر التقييم</option>
                          <option value="متفوق">✅ متفوق</option>
                          <option value="ممتاز">🌟 ممتاز</option>
                          <option value="جيد">جيد</option>
                          <option value="إعادة">🔄 إعادة</option>
                          <option value="غياب">🚫 غياب</option>
                          <option value="إذن">🕒 إذن</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2 space-x-reverse">
                      <button
                        onClick={() => {
                          setShowNextPage(false)
                          setSelectedSubmission(null)
                          setGrade('')
                          setFeedback('')
                          setPageNumber('')
                          setEvaluationGrade('')
                          setNextPageNumber('')
                          setNextPageEvaluation('')
                          fetchSubmissions()
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleNextPageGrade(submission)}
                        disabled={grading === submission.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
                      >
                        <Star className="w-4 h-4" />
                        <span>تسجيل الصفحة التالية</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Show existing grade if already graded */}
                {submission.status === 'graded' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          الدرجة: {submission.grade}
                        </p>
                        <p className="text-sm text-green-600">
                          التقييم: {submission.evaluation_grade}
                        </p>
                        {submission.page_number && (
                          <p className="text-sm text-green-600">
                            الصفحة: {submission.page_number}
                          </p>
                        )}
                      </div>
                    </div>
                    {submission.feedback && (
                      <p className="text-sm text-green-700 mt-2">{submission.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
