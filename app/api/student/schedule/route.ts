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

    // Get student ID - handle missing student gracefully
    const student = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    // If student doesn't exist, return empty schedule
    if (!student.length) {
      return NextResponse.json([])
    }

    const studentId = student[0].id

    // Get schedule items - simplified query with error handling
    let scheduleItems = [];
    
    try {
      // Get all upcoming meetings instead of date-specific
      const result = await executeQuery(`
        SELECT 
          'MEETING' as type,
          m.id,
          m.title,
          DATE(m.scheduled_at) as date,
          TIME(m.scheduled_at) as time,
          m.duration_minutes as duration,
          'معلم تجريبي' as teacher_name,
          CASE 
            WHEN m.scheduled_at > NOW() THEN 'UPCOMING'
            WHEN m.scheduled_at <= NOW() AND DATE_ADD(m.scheduled_at, INTERVAL m.duration_minutes MINUTE) >= NOW() THEN 'ONGOING'
            ELSE 'COMPLETED'
          END as status,
          NULL as location,
          m.join_url as meeting_url
        FROM meetings m
        WHERE m.scheduled_at > NOW()
        ORDER BY m.scheduled_at ASC
        LIMIT 10
      `, []);
      
      scheduleItems = result;
    } catch (error: any) {
      console.log('Error getting schedule:', error?.message || error);
      // Return empty array if query fails
      scheduleItems = [];
    }

    return NextResponse.json(scheduleItems)

  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
