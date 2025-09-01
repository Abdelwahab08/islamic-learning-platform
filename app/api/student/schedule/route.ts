import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
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

    // Get schedule items for the student
    const scheduleItems = await executeQuery(`
             SELECT 
         'ASSIGNMENT' as type,
         a.id,
         a.title,
         a.description,
         DATE(a.created_at) as date,
         TIME(a.created_at) as time,
         60 as duration,
         u.email as teacher_name,
         CASE 
           WHEN a.created_at > NOW() THEN 'UPCOMING'
           WHEN a.created_at <= NOW() AND DATE_ADD(a.created_at, INTERVAL 7 DAY) >= NOW() THEN 'ONGOING'
           ELSE 'COMPLETED'
         END as status,
         NULL as location,
         NULL as meeting_url
       FROM assignments a
       JOIN teachers t ON a.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN teacher_students ts ON t.id = ts.teacher_id
       WHERE ts.student_id = ?
       AND DATE(a.created_at) = ?
      
      UNION ALL
      
             SELECT 
         'MEETING' as type,
         m.id,
         m.title,
         'اجتماع مجدول' as description,
         DATE(m.scheduled_at) as date,
         TIME(m.scheduled_at) as time,
         m.duration_minutes as duration,
         u.email as teacher_name,
         CASE 
           WHEN m.scheduled_at > NOW() THEN 'UPCOMING'
           WHEN m.scheduled_at <= NOW() AND DATE_ADD(m.scheduled_at, INTERVAL m.duration_minutes MINUTE) >= NOW() THEN 'ONGOING'
           ELSE 'COMPLETED'
         END as status,
         NULL as location,
         m.join_url as meeting_url
       FROM meetings m
       JOIN teachers t ON m.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN teacher_students ts ON t.id = ts.teacher_id
       WHERE ts.student_id = ?
       AND DATE(m.scheduled_at) = ?
      
      ORDER BY date, time
    `, [studentId, date, studentId, date])

    return NextResponse.json(scheduleItems)

  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
