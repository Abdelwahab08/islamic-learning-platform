import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Try to fetch from lessons table first
    try {
      const lessonsQuery = `
        SELECT 
          l.id,
          l.day_of_week,
          l.start_time,
          l.subject,
          l.duration_minutes,
          l.room,
          g.name as group_name
        FROM lessons l
        JOIN teachers t ON l.teacher_id = t.id
        LEFT JOIN \`groups\` g ON l.group_id = g.id
        WHERE t.user_id = ?
        ORDER BY 
          CASE l.day_of_week
            WHEN 'monday' THEN 1
            WHEN 'tuesday' THEN 2
            WHEN 'wednesday' THEN 3
            WHEN 'thursday' THEN 4
            WHEN 'friday' THEN 5
            WHEN 'saturday' THEN 6
            WHEN 'sunday' THEN 7
          END,
          l.start_time
      `

      const lessons = await executeQuery(lessonsQuery, [teacherId])

      const transformedLessons = lessons.map((lesson: any) => ({
        id: lesson.id,
        day: lesson.day_of_week,
        time: lesson.start_time,
        subject: lesson.subject,
        group_name: lesson.group_name || 'غير محدد',
        duration: lesson.duration_minutes,
        room: lesson.room
      }))

      return NextResponse.json({
        schedule: transformedLessons,
        total: transformedLessons.length
      })

    } catch (error) {
      // If lessons table doesn't exist, return empty array
      console.log('Lessons table not found, returning empty schedule')
      return NextResponse.json({
        schedule: [],
        total: 0
      })
    }

  } catch (error) {
    console.error('Error fetching teacher schedule:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الجدول الزمني' },
      { status: 500 }
    )
  }
}
