import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { getWeekDays } from '@/lib/dates'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // First get the teacher record ID
    const teacherRecord = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    
    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const stage_id = searchParams.get('stage_id')
    const group_id = searchParams.get('group_id')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'يجب تحديد تاريخ البداية والنهاية' },
        { status: 400 }
      )
    }

    // Get week days
    const days = getWeekDays(new Date(from), new Date(to))

    // Build the base query for students
    let studentsQuery = `
      SELECT DISTINCT
        s.id,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as name,
        st.name_ar as current_stage_name,
        s.current_page,
        s.current_stage_id
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stages st ON s.current_stage_id = st.id
      JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id = ?
    `

    const queryParams: any[] = [teacherId]

    // Add stage filter
    if (stage_id) {
      studentsQuery += ' AND s.current_stage_id = ?'
      queryParams.push(stage_id)
    }

    // Add group filter
    if (group_id) {
      studentsQuery += `
        AND s.id IN (
          SELECT student_id
          FROM group_students
          WHERE group_id = ?
        )
      `
      queryParams.push(group_id)
    }

    studentsQuery += ' ORDER BY u.first_name, u.last_name'

    const students = await executeQuery(studentsQuery, queryParams)

    // Get entries for the date range
    let entries: any[] = []
    if (students.length > 0) {
      const entriesQuery = `
        SELECT
          student_id,
          DATE(date) as date,
          rating,
          page_number,
          notes
        FROM student_ratings
        WHERE date BETWEEN ? AND ?
          AND student_id IN (${students.map(() => '?').join(',')})
      `

      const entriesParams = [from, to, ...students.map((s: any) => s.id)]
      entries = await executeQuery(entriesQuery, entriesParams)
    }

    // Organize entries by student and date
    const entriesMap: { [studentId: string]: { [date: string]: any } } = {}

    entries.forEach((entry: any) => {
      if (!entriesMap[entry.student_id]) {
        entriesMap[entry.student_id] = {}
      }
      entriesMap[entry.student_id][entry.date] = {
        rating: entry.rating,
        page_number: entry.page_number,
        notes: entry.notes
      }
    })

    return NextResponse.json({
      days,
      students,
      entries: entriesMap
    })

  } catch (error) {
    console.error('Error fetching timetable:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل بيانات الجدول' },
      { status: 500 }
    )
  }
}
