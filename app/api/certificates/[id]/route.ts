import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuerySingle } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى هذه البيانات' },
        { status: 403 }
      )
    }

    const certificateId = params.id

    // Detect serial column
    const serialCheck = await executeQuerySingle(`
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificates' AND COLUMN_NAME = 'serial'
    `)
    const serialColumn = (serialCheck?.cnt ?? 0) > 0 ? 'serial' : 'serial_number'

    // Get detailed certificate information
    const certificate = await executeQuerySingle(`
      SELECT 
        c.id,
        c.${serialColumn} AS serial,
        c.grade,
        c.issued_at,
        c.approved_at,
        c.pdf_url,
        c.status,
        su.email as student_name,
        tu.email as teacher_name,
        st.name_ar as stage_name
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN users su ON s.user_id = su.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users tu ON t.user_id = tu.id
      JOIN stages st ON c.stage_id = st.id
      WHERE c.id = ?
    `, [certificateId])

    if (!certificate) {
      return NextResponse.json(
        { message: 'الشهادة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(certificate)

  } catch (error) {
    console.error('Error fetching certificate details:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل تفاصيل الشهادة' },
      { status: 500 }
    )
  }
}
