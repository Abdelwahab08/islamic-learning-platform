import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teacherRecord = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [user.id]
    )

    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    // Get all voice submissions for this teacher
    const submissionsQuery = `
      SELECT 
        vs.id,
        vs.audio_url,
        vs.message,
        vs.submitted_at,
        vs.grade,
        vs.feedback,
        vs.page_number,
        vs.evaluation_grade,
        s.id as student_id,
        s.name as student_name,
        s.current_page,
        u.email as student_email
      FROM voice_submissions vs
      JOIN students s ON vs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE vs.teacher_id = ?
      ORDER BY vs.submitted_at DESC
    `

    const submissions = await executeQuery(submissionsQuery, [teacherId])

    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      student_id: submission.student_id,
      student_name: submission.student_name || submission.student_email.split('@')[0],
      student_email: submission.student_email,
      audio_url: submission.audio_url,
      message: submission.message,
      submitted_at: submission.submitted_at,
      grade: submission.grade,
      feedback: submission.feedback || '',
      page_number: submission.page_number || null,
      evaluation_grade: submission.evaluation_grade || null,
      current_page: submission.current_page || 1,
      status: submission.grade ? 'graded' : 'submitted'
    }))

    return NextResponse.json({
      submissions: transformedSubmissions,
      total: transformedSubmissions.length
    })

  } catch (error) {
    console.error('❌ Error fetching voice submissions:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل التسجيلات الصوتية' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const body = await request.json()

    // Verify teacher owns this submission
    const ownershipQuery = `
      SELECT vs.id FROM voice_submissions vs
      JOIN teachers t ON vs.teacher_id = t.id
      WHERE t.user_id = ? AND vs.id = ?
    `
    const ownership = await executeQuery(ownershipQuery, [teacherId, body.submission_id])
    
    if (ownership.length === 0) {
      return NextResponse.json({ error: 'التسجيل غير موجود' }, { status: 404 })
    }

    // Update voice submission with grade and feedback
    const updateQuery = `
      UPDATE voice_submissions 
      SET grade = ?, feedback = ?, evaluation_grade = ?, page_number = ?
      WHERE id = ?
    `
    await executeQuery(updateQuery, [
      body.grade,
      body.feedback || '',
      body.evaluation_grade,
      body.page_number,
      body.submission_id
    ])

    // Calculate next page based on evaluation grade
    let nextPage = body.page_number
    if (body.evaluation_grade && body.page_number) {
      switch (body.evaluation_grade) {
        case 'متفوق':
        case 'ممتاز':
        case 'جيد':
          // Move to next page
          nextPage = Math.min(body.page_number + 1, 30)
          break
        case 'إعادة':
        case 'غياب':
        case 'إذن':
          // Stay on same page
          nextPage = body.page_number
          break
      }
    }

    // Update student's current page
    if (body.student_id && nextPage) {
      const updateStudentQuery = `
        UPDATE students 
        SET current_page = ?, updated_at = NOW()
        WHERE id = ?
      `
      await executeQuery(updateStudentQuery, [nextPage, body.student_id])
    }

    // Log the evaluation in student progress history
    if (body.student_id && body.page_number && body.evaluation_grade) {
      const logQuery = `
        INSERT INTO student_progress_log (id, student_id, page_number, evaluation_grade, teacher_id, logged_at)
        VALUES (UUID(), ?, ?, ?, ?, NOW())
      `
      await executeQuery(logQuery, [
        body.student_id,
        body.page_number,
        body.evaluation_grade,
        teacherId
      ])
    }

    return NextResponse.json({ 
      message: 'تم تقييم التسجيل الصوتي بنجاح',
      next_page: nextPage
    })

  } catch (error) {
    console.error('❌ Error grading voice submission:', error)
    return NextResponse.json(
      { error: 'فشل في تقييم التسجيل الصوتي' },
      { status: 500 }
    )
  }
}
