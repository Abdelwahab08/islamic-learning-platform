import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/config/database'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Get student ID
    const student = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (!student.length) {
      return NextResponse.json({ message: 'لم يتم العثور على بيانات الطالب' }, { status: 404 })
    }

    const studentId = student[0].id

    // Get schedule items for the student - simplified query without teacher_students table
    const scheduleItems = await executeQuery(`
      SELECT 
        'LESSON' as type,
        l.id,
        l.subject as title,
        CONCAT('درس في ', l.subject) as description,
        CURDATE() as date,
        l.start_time as time,
        l.duration_minutes as duration,
        u.first_name as teacher_name,
        'SCHEDULED' as status,
        l.room as location,
        NULL as meeting_url
      FROM lessons l
      LEFT JOIN users u ON l.teacher_id = u.id
      WHERE l.day_of_week = DAYNAME(CURDATE())
      
      UNION ALL
      
      SELECT 
        'MEETING' as type,
        m.id,
        m.title,
        m.description,
        DATE(m.scheduled_at) as date,
        TIME(m.scheduled_at) as time,
        m.duration as duration,
        u.first_name as teacher_name,
        CASE 
          WHEN m.scheduled_at > NOW() THEN 'UPCOMING'
          WHEN m.scheduled_at <= NOW() AND DATE_ADD(m.scheduled_at, INTERVAL m.duration MINUTE) >= NOW() THEN 'ONGOING'
          ELSE 'COMPLETED'
        END as status,
        NULL as location,
        NULL as meeting_url
      FROM meetings m
      LEFT JOIN users u ON m.teacher_id = u.id
      WHERE m.student_id = ?
      AND DATE(m.scheduled_at) = ?
      
      ORDER BY date, time
    `, [studentId, date])

    return NextResponse.json(scheduleItems)

  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
