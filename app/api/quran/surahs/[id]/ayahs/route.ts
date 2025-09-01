import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surahId = parseInt(params.id)

    if (isNaN(surahId)) {
      return NextResponse.json(
        { message: 'معرف السورة غير صحيح' },
        { status: 400 }
      )
    }

    const ayahs = await executeQuery(
      'SELECT id, surah_id, ayah_number, text_ar FROM quran_ayahs WHERE surah_id = ? ORDER BY ayah_number',
      [surahId]
    )

    return NextResponse.json(ayahs)

  } catch (error) {
    console.error('Ayahs error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
