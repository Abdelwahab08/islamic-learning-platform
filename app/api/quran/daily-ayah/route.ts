import { NextResponse } from 'next/server'
import { executeQuerySingle } from '@/lib/db'

export async function GET() {
  try {
    // Get total number of ayahs
    const totalAyahs = await executeQuerySingle(
      'SELECT COUNT(*) as count FROM quran_ayahs'
    )

    if (!totalAyahs || !totalAyahs.count) {
      return NextResponse.json(
        { message: 'لا توجد بيانات قرآنية متاحة' },
        { status: 404 }
      )
    }

    // Generate deterministic index based on current date
    const today = new Date()
    const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD
    const dateHash = dateString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const ayahIndex = Math.abs(dateHash) % totalAyahs.count + 1

    // Get the ayah
    const ayah = await executeQuerySingle(`
      SELECT 
        qa.id,
        qa.surah_id,
        qa.ayah_number,
        qa.text_ar,
        qs.name_ar as surah_name
      FROM quran_ayahs qa
      JOIN quran_surahs qs ON qa.surah_id = qs.id
      WHERE qa.id = ?
    `, [ayahIndex])

    if (!ayah) {
      return NextResponse.json(
        { message: 'لم يتم العثور على الآية' },
        { status: 404 }
      )
    }

    return NextResponse.json(ayah)

  } catch (error) {
    console.error('Daily ayah error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
