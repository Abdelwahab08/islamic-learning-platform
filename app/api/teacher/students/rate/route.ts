import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, date, stage_id, page_number, rating, notes } = body

    if (!student_id || !date || !rating) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Check if rating already exists for this student and date
    const existingRating = await executeQuery(
      'SELECT id FROM student_ratings WHERE student_id = ? AND date = ?',
      [student_id, date]
    )

    let result
    if (existingRating.length > 0) {
      // Update existing rating
      await executeQuery(
        `UPDATE student_ratings 
         SET rating = ?, page_number = ?, notes = ?, updated_at = NOW()
         WHERE student_id = ? AND date = ?`,
        [rating, page_number, notes, student_id, date]
      )
      
      result = await executeQuery(
        'SELECT * FROM student_ratings WHERE student_id = ? AND date = ?',
        [student_id, date]
      )
    } else {
      // Insert new rating
      await executeQuery(
        `INSERT INTO student_ratings 
         (student_id, date, stage_id, page_number, rating, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [student_id, date, stage_id, page_number, rating, notes]
      )
      
      result = await executeQuery(
        'SELECT * FROM student_ratings WHERE student_id = ? AND date = ?',
        [student_id, date]
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
