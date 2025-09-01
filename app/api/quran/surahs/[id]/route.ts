import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeUpdate, executeQuerySingle } from '@/lib/db'

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

    const surah = await executeQuerySingle(
      'SELECT id, name_ar, ayah_count FROM quran_surahs WHERE id = ?',
      [surahId]
    )

    if (!surah) {
      return NextResponse.json(
        { message: 'لم يتم العثور على السورة' },
        { status: 404 }
      )
    }

    return NextResponse.json(surah)

  } catch (error) {
    console.error('Surah error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بحذف السور' },
        { status: 403 }
      )
    }

    const surahId = params.id

    // Delete ayahs first (due to foreign key constraint)
    await executeUpdate(
      'DELETE FROM quran_ayahs WHERE surah_id = ?',
      [surahId]
    )

    // Then delete the surah
    const result = await executeUpdate(
      'DELETE FROM quran_surahs WHERE id = ?',
      [surahId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'السورة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'تم حذف السورة بنجاح'
    })

  } catch (error) {
    console.error('Error deleting surah:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في حذف السورة' },
      { status: 500 }
    )
  }
}
