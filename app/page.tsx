'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, BookOpen, Users, GraduationCap, Star, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import Footer from './components/Footer'

interface DailyAyah {
  id: number
  surah_id: number
  ayah_number: number
  text_ar: string
  surah_name: string
}

interface ToastBanner {
  id: string
  title: string
  body: string
}

export default function HomePage() {
  const [dailyAyah, setDailyAyah] = useState<DailyAyah | null>(null)
  const [toastBanner, setToastBanner] = useState<ToastBanner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch daily ayah
        const ayahResponse = await fetch('/api/quran/daily-ayah')
        if (ayahResponse.ok) {
          const ayahData = await ayahResponse.json()
          setDailyAyah(ayahData)
        }

        // Fetch active toast banner
        const toastResponse = await fetch('/api/toasts/active')
        if (toastResponse.ok) {
          const toastData = await toastResponse.json()
          setToastBanner(toastData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('حدث خطأ في تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const heroCards = [
    {
      title: 'تسجيل الدخول',
      description: 'دخول للمستخدمين المسجلين',
      icon: <Users className="w-8 h-8" />,
      href: '/auth/login',
      color: 'bg-primary',
    },
    {
      title: 'كن معلّمًا',
      description: 'تقديم طلب للانضمام كمعلم',
      icon: <GraduationCap className="w-8 h-8" />,
      href: '/auth/apply-teacher',
      color: 'bg-accent',
    },
    {
      title: 'تسجيل طالب جديد',
      description: 'إنشاء حساب جديد للطالب',
      icon: <Star className="w-8 h-8" />,
      href: '/auth/register-student',
      color: 'bg-green-600',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Toast Banner */}
      {toastBanner && (
        <div className="bg-primary text-white p-4 text-center">
          <div className="container mx-auto">
            <h3 className="text-lg font-bold mb-2">{toastBanner.title}</h3>
            <p className="text-sm opacity-90">{toastBanner.body}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-accent text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.jpg" 
                alt="منصة التعلم الإسلامي" 
                className="w-24 h-24 rounded-full shadow-lg"
              />
            </div>
                         <h1 className="text-5xl font-bold mb-6">منصه يقين لتعليم القرآن الكريم</h1>
             <p className="text-xl opacity-90 max-w-2xl mx-auto">
               منصة تعليمية متخصصة في تعليم القرآن الكريم والعلوم الإسلامية
             </p>
          </div>

          {/* Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {heroCards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group block"
              >
                <div className={`${card.color} p-8 rounded-2xl text-center transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                  <div className="mb-4 flex justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <p className="opacity-90">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Quran Button */}
          <div className="text-center">
            <Link
              href="/quran"
              className="inline-flex items-center bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-6 h-6 ml-3" />
              القرآن الكريم
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Daily Ayah */}
            <div className="card">
              <div className="flex items-center mb-6">
                <Star className="w-6 h-6 text-primary ml-2" />
                <h2 className="text-2xl font-bold text-primary">آية اليوم</h2>
              </div>
              
              {dailyAyah ? (
                <div className="text-center">
                  <div className="quran-text mb-6 leading-relaxed">
                    {dailyAyah.text_ar}
                  </div>
                  <div className="text-muted text-lg mb-4">
                    {dailyAyah.surah_name} - {dailyAyah.ayah_number}
                  </div>
                  <button className="btn-secondary inline-flex items-center">
                    <Play className="w-5 h-5 ml-2" />
                    استماع
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>جاري تحميل آية اليوم...</p>
                </div>
              )}
            </div>

            {/* About Us */}
            <div className="card">
              <div className="flex items-center mb-6">
                <Info className="w-6 h-6 text-primary ml-2" />
                <h2 className="text-2xl font-bold text-primary">تعرف علينا</h2>
              </div>
              
              <div className="space-y-4">
                                 <p className="text-muted leading-relaxed">
                   منصه يقين لتعليم القرآن الكريم هي منصة تعليمية متخصصة في تعليم القرآن الكريم 
                   والعلوم الإسلامية بطريقة حديثة ومتطورة.
                 </p>
                <p className="text-muted leading-relaxed">
                  نقدم برامج تعليمية شاملة تشمل التلاوة والحفظ والإجازة 
                  والدورات الشرعية المختلفة.
                </p>
                <Link
                  href="/about"
                  className="btn-outline inline-block mt-4"
                >
                  المزيد عنا
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">مميزات المنصة</h2>
            <p className="text-muted text-lg">نقدم أفضل تجربة تعليمية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">تعليم القرآن</h3>
              <p className="text-muted">تعلم القرآن الكريم بطريقة منهجية ومتدرجة</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">معلمون متخصصون</h3>
              <p className="text-muted">فريق من المعلمين المؤهلين والمتخصصين</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">شهادات معتمدة</h3>
              <p className="text-muted">إصدار شهادات معتمدة بعد إتمام المراحل</p>
            </div>
          </div>
                 </div>
       </section>
       
       {/* Footer with Social Media Links */}
       <Footer />
     </div>
   )
 }
