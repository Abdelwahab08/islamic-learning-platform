import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeUpdate } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بحذف الآيات' },
        { status: 403 }
      )
    }

    const ayahId = params.id

    const result = await executeUpdate(
      'DELETE FROM quran_ayahs WHERE id = ?',
      [ayahId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'الآية غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'تم حذف الآية بنجاح'
    })

  } catch (error) {
    console.error('Error deleting ayah:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في حذف الآية' },
      { status: 500 }
    )
  }
}
