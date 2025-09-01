'use client'

import { useState, useRef } from 'react'
import DashboardLayout from '@/app/components/DashboardLayout'
import { Mic, MicOff, Play, Pause, Send, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VoiceSubmissionPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('بدأ التسجيل')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('فشل في بدء التسجيل')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('تم إيقاف التسجيل')
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast.error('يرجى تسجيل رسالة صوتية أولاً')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('message', message || 'تسجيل صوتي جديد')

      const response = await fetch('/api/student/voice-submission', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('تم إرسال التسجيل الصوتي بنجاح')
        setAudioBlob(null)
        setAudioUrl(null)
        setMessage('')
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'فشل في إرسال التسجيل الصوتي')
      }
    } catch (error) {
      console.error('Error submitting voice recording:', error)
      toast.error('حدث خطأ في إرسال التسجيل الصوتي')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">التسجيل الصوتي</h1>
          <p className="text-muted">سجل رسالة صوتية وأرسلها إلى معلمك</p>
        </div>

        <div className="card">
          <div className="space-y-6">
            {/* Recording Controls */}
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
                  disabled={isSubmitting}
                >
                  <Mic className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full transition-colors"
                >
                  <MicOff className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 space-x-reverse bg-red-100 text-red-800 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>جاري التسجيل...</span>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {audioUrl && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  <button
                    onClick={playAudio}
                    className="bg-primary hover:bg-primary-dark text-white p-3 rounded-full transition-colors"
                    disabled={isSubmitting}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={deleteRecording}
                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full"
                />
              </div>
            )}

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رسالة (اختياري)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة مع التسجيل الصوتي..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!audioBlob || isSubmitting}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
              >
                <Send className="w-5 h-5" />
                <span>إرسال التسجيل الصوتي</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center text-gray-500 text-sm">
              <p>• اضغط على زر الميكروفون لبدء التسجيل</p>
              <p>• اضغط على زر إيقاف لإيقاف التسجيل</p>
              <p>• يمكنك الاستماع للتسجيل قبل الإرسال</p>
              <p>• سيتم إرسال التسجيل إلى معلمك المسند</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
