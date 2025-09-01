'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Play, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Surah {
  id: number
  name_ar: string
  ayah_count: number
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('/api/quran/surahs')
        if (response.ok) {
          const data = await response.json()
          setSurahs(data.surahs || [])
        } else {
          toast.error('حدث خطأ في تحميل السور')
          setSurahs([])
        }
      } catch (error) {
        console.error('Error fetching surahs:', error)
        toast.error('حدث خطأ في الاتصال')
        setSurahs([])
      } finally {
        setLoading(false)
      }
    }

    fetchSurahs()
  }, [])

  const filteredSurahs = surahs.filter(surah =>
    surah.name_ar.includes(searchTerm) || surah.id.toString().includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo.jpg" 
                alt="منصة التعلم الإسلامي" 
                className="w-16 h-16 rounded-full shadow-md"
              />
            </div>
                         <h1 className="text-4xl font-bold mb-4">منصه يقين</h1>
            <p className="text-xl opacity-90">استمع وتلاوة القرآن الكريم</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن السورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Surahs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSurahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/quran/${surah.id}`}
              className="card-hover group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent transition-colors">
                  <span className="text-white font-bold text-lg">{surah.id}</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                  {surah.name_ar}
                </h3>
                <p className="text-muted text-sm">
                  {surah.ayah_count} آية
                </p>
                <div className="mt-4 flex justify-center">
                  <Play className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredSurahs.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-muted text-lg">لم يتم العثور على سورة بهذا الاسم</p>
          </div>
        )}
      </div>
    </div>
  )
}
