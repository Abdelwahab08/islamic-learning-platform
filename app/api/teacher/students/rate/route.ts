import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    console.log('Getting teacher record for user ID:', teacherId)

    // Get teacher record ID
    let teacherRecordId = null
    try {
      const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
      if (teachers.length === 0) {
        console.log('No teacher record found for user:', teacherId)
        return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
      }
      teacherRecordId = teachers[0].id
      console.log('Found teacher record ID:', teacherRecordId)
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json({ error: 'فشل في العثور على المدرس' }, { status: 500 })
    }

    const body = await request.json()
    const { student_id, date, stage_id, page_number, rating, notes } = body

    console.log('Rating submission data:', { student_id, date, stage_id, page_number, rating, notes })

    if (!student_id || !date || !rating) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if rating already exists for this student and date
    const existingRating = await executeQuery(
      'SELECT id FROM progress_logs WHERE student_id = ? AND DATE(created_at) = ?',
      [student_id, date]
    )

    let result
    if (existingRating.length > 0) {
      // Update existing rating - keep the same created_at date but update other fields
      await executeQuery(
        `UPDATE progress_logs 
         SET rating = ?, page_number = ?, notes = ?
         WHERE student_id = ? AND DATE(created_at) = ?`,
        [rating, page_number, notes, student_id, date]
      )
      
      result = await executeQuery(
        'SELECT * FROM progress_logs WHERE student_id = ? AND DATE(created_at) = ?',
        [student_id, date]
      )
    } else {
      // Insert new rating with the specific date at noon to avoid timezone issues
      const ratingId = uuidv4()
      const dateTime = `${date} 12:00:00`
      
      await executeQuery(
        `INSERT INTO progress_logs 
         (id, student_id, teacher_id, stage_id, page_number, rating, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ratingId, student_id, teacherRecordId, stage_id, page_number, rating, notes, dateTime]
      )
      
      result = await executeQuery(
        'SELECT * FROM progress_logs WHERE id = ?',
        [ratingId]
      )
    }

    // Update student's current page and stage if rating is good
    if (rating === 'متفوق' || rating === 'ممتاز' || rating === 'جيد') {
      await executeQuery(
        `UPDATE students 
         SET current_page = ?, 
             current_stage_id = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [page_number, stage_id, student_id]
      )
    }

    // Get updated student data
    const student = await executeQuery(
      `SELECT s.*, st.name_ar as current_stage_name, 
              CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as name
       FROM students s
       LEFT JOIN stages st ON s.current_stage_id = st.id
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [student_id]
    )

    return NextResponse.json({
      entry: result[0],
      student: student[0]
    })

  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'فشل في تسجيل التقييم' },
      { status: 500 }
    )
  }
}
