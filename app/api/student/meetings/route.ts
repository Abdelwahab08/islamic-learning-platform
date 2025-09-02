import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/config/database'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get student record ID - handle missing student gracefully
    const student = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    // If student doesn't exist, return empty meetings
    if (student.length === 0) {
      return NextResponse.json([])
    }

    const studentId = student[0].id

    // Get meetings - ONLY from assigned teacher
    let meetings = [];
    
    try {
      const result = await executeQuery(`
        SELECT 
          m.id,
          m.title,
          m.scheduled_at,
          m.duration_minutes as duration_minutes,
          m.status,
          CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as teacher_name,
          COALESCE(m.provider, 'ZOOM') as provider,
          m.join_url as join_url,
          COALESCE(s.name_ar, 'المرحلة المتوسطة') as stage_name
        FROM meetings m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN teacher_students ts ON t.id = ts.teacher_id
        LEFT JOIN stages s ON m.stage_id = s.id
        WHERE ts.student_id = ?
        ORDER BY m.scheduled_at DESC
        LIMIT 10
      `, [studentId]);
      
      meetings = result;
    } catch (error: any) {
      console.log('Error getting meetings:', error?.message || error);
      // Return empty array if query fails
      meetings = [];
    }

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
