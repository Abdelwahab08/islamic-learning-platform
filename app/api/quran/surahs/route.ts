import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const surahs = await executeQuery(`
      SELECT 
        id,
        name_ar,
        ayah_count
      FROM quran_surahs 
      ORDER BY id
    `)

    return NextResponse.json({
      surahs: surahs,
      total: surahs.length
    })

  } catch (error) {
    console.error('Error fetching surahs:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في تحميل السور' },
      { status: 500 }
    )
  }
}
