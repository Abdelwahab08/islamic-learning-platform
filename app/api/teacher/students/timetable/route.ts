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
          FROM \`group_members\`
          WHERE group_id = ?
        )
      `
      queryParams.push(group_id)
    }

    // Fix: Order by the 'name' alias instead of raw column names (DISTINCT requirement)
    studentsQuery += ' ORDER BY name'

    const students = await executeQuery(studentsQuery, queryParams)

    // Get entries for the date range - use progress_logs table instead of student_ratings
    let entries: any[] = []
    if (students.length > 0) {
      const entriesQuery = `
        SELECT
          student_id,
          DATE(created_at) as date,
          rating,
          page_number,
          notes
        FROM progress_logs
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND student_id IN (${students.map(() => '?').join(',')})
          AND teacher_id = ?
      `

      const entriesParams = [from, to, ...students.map((s: any) => s.id), teacherId]
      console.log('Fetching entries with params:', { from, to, teacherId, studentIds: students.map((s: any) => s.id) })
      
      entries = await executeQuery(entriesQuery, entriesParams)
      console.log('Found entries:', entries)
      
      // Debug: Check if there are any ratings in the database at all
      const allRatings = await executeQuery('SELECT COUNT(*) as count FROM progress_logs WHERE teacher_id = ?', [teacherId])
      console.log('Total ratings in database for this teacher:', allRatings[0].count)
      
      // Debug: Check ratings for the specific date range
      const dateRangeRatings = await executeQuery('SELECT COUNT(*) as count FROM progress_logs WHERE DATE(created_at) BETWEEN ? AND ?', [from, to])
      console.log('Total ratings in date range:', dateRangeRatings[0].count)
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

    console.log('Final entries map:', entriesMap)
    console.log('Returning data structure:', { 
      days: days.length, 
      studentsCount: students.length, 
      entriesCount: Object.keys(entriesMap).length,
      sampleEntries: Object.keys(entriesMap).slice(0, 3)
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
