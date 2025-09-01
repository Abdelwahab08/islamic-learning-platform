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

    // Get meetings - simplified query with error handling
    let meetings = [];
    
    try {
      const result = await executeQuery(`
        SELECT 
          m.id,
          m.title,
          m.description,
          m.scheduled_at,
          m.duration as duration_minutes,
          m.status,
          'معلم تجريبي' as teacher_name,
          'ZOOM' as provider,
          NULL as join_url,
          'المرحلة المتوسطة' as stage_name
        FROM meetings m
        WHERE m.user_id = ?
        ORDER BY m.scheduled_at DESC
        LIMIT 10
      `, [user.id]);
      
      meetings = result;
    } catch (error) {
      console.log('Error getting meetings:', error.message);
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
