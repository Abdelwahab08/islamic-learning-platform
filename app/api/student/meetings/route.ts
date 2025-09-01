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

    // Get meetings for this student - using correct column names
    const meetings = await executeQuery(`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.scheduled_at,
        m.duration,
        m.status,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM meetings m
      LEFT JOIN users u ON m.teacher_id = u.id
      WHERE m.student_id = ?
      ORDER BY m.scheduled_at DESC
    `, [studentId])

    const transformedMeetings = meetings.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      scheduledAt: meeting.scheduled_at,
      duration: meeting.duration,
      status: meeting.status,
      teacherName: `${meeting.teacher_first_name || ''} ${meeting.teacher_last_name || ''}`.trim()
    }))

    return NextResponse.json({ meetings: transformedMeetings })

  } catch (error) {
    console.error('Error fetching student meetings:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
