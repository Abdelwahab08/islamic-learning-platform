'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface Ayah {
  id: number
  surah_id: number
  ayah_number: number
  text_ar: string
}

interface Surah {
  id: number
  name_ar: string
  ayah_count: number
}

export default function SurahPage() {
  const params = useParams()
  const surahId = params.surahId as string
  
  const [surah, setSurah] = useState<Surah | null>(null)
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSurahData = async () => {
      try {
        // Fetch surah info
        const surahResponse = await fetch(`/api/quran/surahs/${surahId}`)
        if (surahResponse.ok) {
          const surahData = await surahResponse.json()
          setSurah(surahData)
        }

        // Fetch ayahs
        const ayahsResponse = await fetch(`/api/quran/surahs/${surahId}/ayahs`)
        if (ayahsResponse.ok) {
          const ayahsData = await ayahsResponse.json()
          setAyahs(ayahsData)
        }
      } catch (error) {
        console.error('Error fetching surah data:', error)
        toast.error('حدث خطأ في تحميل السورة')
      } finally {
        setLoading(false)
      }
    }

    if (surahId) {
      fetchSurahData()
    }
  }, [surahId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!surah) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-lg mb-4">لم يتم العثور على السورة</p>
          <Link href="/quran" className="btn-primary">
            العودة لصفحة السور
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/quran" className="flex items-center text-white hover:text-gray-200">
              <ArrowLeft className="w-5 h-5 ml-2" />
              العودة للسور
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{surah.name_ar}</h1>
              <p className="opacity-90">{surah.ayah_count} آية</p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Ayahs */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {ayahs.map((ayah) => (
            <div
              key={ayah.id}
              className="card mb-4"
            >
              <div className="flex-1">
                <div className="quran-text mb-4 leading-relaxed text-right">
                  {ayah.text_ar}
                </div>
                <div className="text-muted text-sm">
                  آية {ayah.ayah_number}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
