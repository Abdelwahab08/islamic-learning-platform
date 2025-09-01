'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Play, 
  Pause, 
  Volume2, 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Surah {
  id: string
  name_ar: string
  ayah_count: number
}

interface Ayah {
  id: string
  surah_id: string
  ayah_number: number
  text_ar: string
}

export default function AdminQuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSurah, setSelectedSurah] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'surahs' | 'ayahs'>('surahs')

  useEffect(() => {
    fetchSurahs()
  }, [])

  useEffect(() => {
    if (selectedSurah) {
      fetchAyahs(selectedSurah)
    }
  }, [selectedSurah])

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/quran/surahs')
      if (response.ok) {
        const data = await response.json()
        setSurahs(data)
      } else {
        toast.error('فشل في تحميل السور')
      }
    } catch (error) {
      toast.error('فشل في تحميل السور')
    } finally {
      setLoading(false)
    }
  }

  const fetchAyahs = async (surahId: string) => {
    try {
      const response = await fetch(`/api/quran/surahs/${surahId}/ayahs`)
      if (response.ok) {
        const data = await response.json()
        setAyahs(data)
      } else {
        toast.error('فشل في تحميل الآيات')
      }
    } catch (error) {
      toast.error('فشل في تحميل الآيات')
    }
  }

  const deleteSurah = async (surahId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه السورة؟')) return

    try {
      const response = await fetch(`/api/quran/surahs/${surahId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('تم حذف السورة بنجاح')
        fetchSurahs()
      } else {
        toast.error('فشل في حذف السورة')
      }
    } catch (error) {
      toast.error('فشل في حذف السورة')
    }
  }

  const deleteAyah = async (ayahId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الآية؟')) return

    try {
      const response = await fetch(`/api/quran/ayahs/${ayahId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('تم حذف الآية بنجاح')
        if (selectedSurah) {
          fetchAyahs(selectedSurah)
        }
      } else {
        toast.error('فشل في حذف الآية')
      }
    } catch (error) {
      toast.error('فشل في حذف الآية')
    }
  }

  const filteredSurahs = surahs.filter(surah =>
    surah.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.id.toString().includes(searchTerm)
  )

      const filteredAyahs = ayahs.filter(ayah =>
      ayah.text_ar.includes(searchTerm) ||
      ayah.ayah_number.toString().includes(searchTerm)
    )

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة القرآن الكريم</h1>
        <p className="text-gray-600">إدارة السور والآيات والمحتوى القرآني</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 space-x-reverse mb-4">
          <Button
            onClick={() => setActiveTab('surahs')}
            variant={activeTab === 'surahs' ? 'default' : 'outline'}
            className="btn-primary"
          >
            <BookOpen className="w-4 h-4 ml-2" />
            السور
          </Button>
          <Button
            onClick={() => setActiveTab('ayahs')}
            variant={activeTab === 'ayahs' ? 'default' : 'outline'}
            className="btn-primary"
          >
            <BookOpen className="w-4 h-4 ml-2" />
            الآيات
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="البحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {activeTab === 'surahs' && (
        <div className="grid gap-6">
          {filteredSurahs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد سور للعرض'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSurahs.map((surah) => (
              <Card key={surah.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="w-6 h-6 text-green-500 ml-2" />
                                             <CardTitle className="text-lg mr-2">
                         {surah.id}. {surah.name_ar}
                       </CardTitle>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      سورة قرآنية
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">الاسم:</span>
                        <span className="mr-2">{surah.name_ar}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <BookOpen className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="font-medium">عدد الآيات:</span>
                        <span className="mr-2">{surah.ayah_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedSurah(surah.id)
                        setActiveTab('ayahs')
                      }}
                      className="btn-secondary"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض الآيات
                    </Button>
                    
                    <Button variant="outline" className="btn-outline">
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    
                    <Button
                      onClick={() => deleteSurah(surah.id)}
                      variant="outline"
                      className="btn-outline text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'ayahs' && (
        <div className="grid gap-6">
          {selectedSurah && (
            <div className="mb-4">
              <Button
                onClick={() => {
                  setSelectedSurah(null)
                  setAyahs([])
                }}
                variant="outline"
                className="btn-outline"
              >
                ← العودة إلى السور
              </Button>
            </div>
          )}

          {filteredAyahs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد آيات للعرض'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAyahs.map((ayah) => (
              <Card key={ayah.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                        <BookOpen className="w-6 h-6 text-blue-500 ml-2" />
                        <CardTitle className="text-lg">آية رقم {ayah.ayah_number}</CardTitle>
                      </div>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800">آية {ayah.ayah_number}</Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <p className="text-lg text-right leading-relaxed font-arabic">
                      {ayah.text_ar}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="btn-secondary">
                      <Play className="w-4 h-4 ml-2" />
                      تشغيل
                    </Button>
                    
                    <Button variant="outline" className="btn-outline">
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    
                    <Button
                      onClick={() => deleteAyah(ayah.id)}
                      variant="outline"
                      className="btn-outline text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
