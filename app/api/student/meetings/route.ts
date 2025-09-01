import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get student record ID
    const student = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (student.length === 0) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات الطالب' },
        { status: 404 }
      )
    }

    const studentId = student[0].id

    // Get meetings for this student - returning exact structure frontend expects
    const meetings = await executeQuery(`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.scheduled_at,
        m.duration as duration_minutes,
        m.status,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        'ZOOM' as provider,
        NULL as join_url,
        'المرحلة المتوسطة' as stage_name
      FROM meetings m
      LEFT JOIN users u ON m.teacher_id = u.id
      WHERE m.student_id = ?
      ORDER BY m.scheduled_at DESC
    `, [studentId])

    // Return the data directly as the frontend expects
    return NextResponse.json(meetings)

  } catch (error) {
    console.error('Error fetching student meetings:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
