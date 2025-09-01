import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

// GET - Get all submissions for an assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const assignmentId = params.id

    // Verify teacher owns this assignment
    const ownershipQuery = `
      SELECT a.id FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      WHERE t.user_id = ? AND a.id = ?
    `
    const ownership = await executeQuery(ownershipQuery, [teacherId, assignmentId])
    
    if (ownership.length === 0) {
      return NextResponse.json({ error: 'الواجب غير موجود' }, { status: 404 })
    }

    // Simple check - are there any submissions for this assignment?
    const simpleCheck = await executeQuery('SELECT COUNT(*) as count FROM submissions WHERE assignment_id = ?', [assignmentId])
    console.log('🔍 DEBUG: Simple check - total submissions for assignment:', simpleCheck[0]?.count)

    // Get all submissions for this assignment with student progress
    const submissionsQuery = `
      SELECT 
        sub.id,
        sub.content,
        sub.submitted_at,
        sub.grade,
        sub.feedback,
        sub.file_url as audio_url,
        sub.page_number,
        sub.evaluation_grade,
        s.id as student_id,
        s.current_page,
        COALESCE(u.email, 'طالب غير معروف') as student_name,
        COALESCE(u.email, 'unknown@email.com') as student_email
      FROM submissions sub
      LEFT JOIN students s ON sub.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE sub.assignment_id = ?
      ORDER BY sub.submitted_at DESC
    `
    
    const submissions = await executeQuery(submissionsQuery, [assignmentId])
    
    console.log('🔍 DEBUG: Raw submissions from database:', submissions)
    console.log('🔍 DEBUG: Assignment ID:', assignmentId)
    console.log('🔍 DEBUG: Teacher ID:', teacherId)
    console.log('🔍 DEBUG: Submissions count:', submissions.length)
    
    // Check if the issue is with the JOIN - let's get submissions without JOIN first
    const submissionsWithoutJoin = await executeQuery('SELECT * FROM submissions WHERE assignment_id = ?', [assignmentId])
    console.log('🔍 DEBUG: Submissions without JOIN:', submissionsWithoutJoin.length)
    if (submissionsWithoutJoin.length > 0) {
      console.log('🔍 DEBUG: Sample submission without JOIN:', submissionsWithoutJoin[0])
    }

    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      student_id: submission.student_id || 'unknown',
      student_name: submission.student_name || submission.student_email?.split('@')[0] || 'طالب غير معروف',
      student_email: submission.student_email || 'unknown@email.com',
      content: submission.content || '',
      submitted_at: submission.submitted_at,
      grade: submission.grade,
      feedback: submission.feedback || '',
      audio_url: submission.audio_url ? `/api/uploads/assignments/${submission.audio_url}` : null,
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
    console.error('Error fetching assignment submissions:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      assignmentId: params.id
    })
    
    // Ensure we always return valid JSON
    return NextResponse.json(
            {
        error: 'فشل في تحميل تسليمات الواجب',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'database_connection_error'
      },
      { status: 500 }
    )
  }
}

// PUT - Grade a submission with evaluation and page tracking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const assignmentId = params.id
    const body = await request.json()

    console.log('Rating submission with data:', body)

    // Verify teacher owns this assignment
    const ownershipQuery = `
      SELECT a.id FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      WHERE t.user_id = ? AND a.id = ?
    `
    const ownership = await executeQuery(ownershipQuery, [teacherId, assignmentId])
    
    if (ownership.length === 0) {
      return NextResponse.json({ error: 'الواجب غير موجود' }, { status: 404 })
    }

    // Update submission with grade and feedback
    const updateQuery = `
      UPDATE submissions 
      SET grade = ?, feedback = ?, page_number = ?
      WHERE id = ? AND assignment_id = ?
    `
    await executeQuery(updateQuery, [
      body.grade,
      body.feedback || '',
      body.page_number,
      body.submission_id,
      assignmentId
    ])

    // Calculate next page and level progression based on grade
    let nextPage = body.page_number
    let shouldLevelUp = false
    
    if (body.grade && body.page_number) {
      // Grade-based progression logic
      const grade = parseInt(body.grade)
      if (grade >= 4) {
        // Grade 4 or 5: Move to next page
        nextPage = Math.min(body.page_number + 1, 30)
        if (grade === 5) {
          shouldLevelUp = true // Grade 5 triggers level up
        }
      } else if (grade >= 3) {
        // Grade 3: Stay on same page
        nextPage = body.page_number
      } else {
        // Grade 1 or 2: Stay on same page (needs improvement)
        nextPage = body.page_number
      }
    }

    // Update student's current page and potentially level up
    if (body.student_id && nextPage) {
      let updateStudentQuery = `
        UPDATE students 
        SET current_page = ?, updated_at = NOW()
        WHERE id = ?
      `
      
      // If grade is 5, level up the student
      if (shouldLevelUp) {
        // Get current stage and move to next stage
        const currentStageQuery = `
          SELECT s.stage_id, st.order_index
          FROM students s
          JOIN stages st ON s.stage_id = st.id
          WHERE s.id = ?
        `
        const currentStage = await executeQuery(currentStageQuery, [body.student_id])
        
        if (currentStage.length > 0) {
          const currentOrder = currentStage[0].order_index
          
          // Get next stage
          const nextStageQuery = `
            SELECT id FROM stages 
            WHERE order_index = ? 
            LIMIT 1
          `
          const nextStage = await executeQuery(nextStageQuery, [currentOrder + 1])
          
          if (nextStage.length > 0) {
            updateStudentQuery = `
              UPDATE students 
              SET current_page = ?, stage_id = ?, updated_at = NOW()
              WHERE id = ?
            `
            await executeQuery(updateStudentQuery, [nextPage, nextStage[0].id, body.student_id])
          } else {
            // No next stage, just update page
            await executeQuery(updateStudentQuery, [nextPage, body.student_id])
          }
        } else {
          // Fallback: just update page
          await executeQuery(updateStudentQuery, [nextPage, body.student_id])
        }
      } else {
        // Just update page
        await executeQuery(updateStudentQuery, [nextPage, body.student_id])
      }
    }

    console.log('Rating submission successful, next page:', nextPage)

    return NextResponse.json({ 
      message: 'تم تقييم التسليم بنجاح',
      next_page: nextPage
    })

  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json(
      { error: 'فشل في تقييم التسليم' },
      { status: 500 }
    )
  }
}

// POST - Quick next page registration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const assignmentId = params.id
    const body = await request.json()

    console.log('Quick page registration with data:', body)

    // Verify teacher owns this assignment
    const ownershipQuery = `
      SELECT a.id FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      WHERE t.user_id = ? AND a.id = ?
    `
    const ownership = await executeQuery(ownershipQuery, [teacherId, assignmentId])
    
    if (ownership.length === 0) {
      return NextResponse.json({ error: 'الواجب غير موجود' }, { status: 404 })
    }

    // Calculate next page
    let nextPage = body.current_page
    if (body.evaluation_grade && body.current_page) {
      switch (body.evaluation_grade) {
        case 'متفوق':
        case 'ممتاز':
        case 'جيد':
          nextPage = Math.min(body.current_page + 1, 30)
          break
        case 'إعادة':
        case 'غياب':
        case 'إذن':
          nextPage = body.current_page
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

    console.log('Quick page registration successful, next page:', nextPage)

    return NextResponse.json({ 
      message: 'تم تسجيل الصفحة بنجاح',
      next_page: nextPage
    })

  } catch (error) {
    console.error('Error logging page:', error)
    return NextResponse.json(
      { error: 'فشل في تسجيل الصفحة' },
      { status: 500 }
    )
  }
}
