import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  let user = null;
  
  try {
    // Get current user with better error handling
    try {
      user = await getCurrentUser()
    } catch (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'خطأ في المصادقة - يرجى تسجيل الدخول مرة أخرى' }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found - authentication failed')
      return NextResponse.json({ error: 'غير مصرح - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    if (user.role !== 'TEACHER') {
      console.error('User is not a teacher:', user.role)
      return NextResponse.json({ error: 'غير مصرح - يجب أن تكون مدرس' }, { status: 403 })
    }

    // First get the teacher ID from the user ID
    const teacherQuery = 'SELECT id FROM teachers WHERE user_id = ?'
    let teacherId;
    try {
      const teacherResult = await executeQuery(teacherQuery, [user.id])
      if (teacherResult.length === 0) {
        console.error('🔍 DEBUG: No teacher found for user ID:', user.id)
        return NextResponse.json({
          assignments: [],
          total: 0
        })
      }
      teacherId = teacherResult[0].id
      console.log('🔍 DEBUG: Teacher ID:', teacherId)
      console.log('🔍 DEBUG: User object:', { id: user.id, email: user.email, role: user.role })
    } catch (teacherError) {
      console.error('🔍 DEBUG: Error getting teacher ID:', teacherError)
      return NextResponse.json({
        assignments: [],
        total: 0
      })
    }

    const assignmentsQuery = `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_at,
        a.created_at,
        st.name_ar as stage_name,
        (SELECT COUNT(*) FROM assignment_targets WHERE assignment_id = a.id) as target_students,
        (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submissions_count,
        (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id AND grade IS NOT NULL) as graded_count
      FROM assignments a
      LEFT JOIN stages st ON a.stage_id = st.id
      WHERE a.teacher_id = ?
      ORDER BY a.created_at DESC
    `

    console.log('🔍 DEBUG: Executing assignments query with teacherId:', teacherId)
    
    let assignments;
    try {
      console.log('🔍 DEBUG: About to execute query with teacherId:', teacherId)
      assignments = await executeQuery(assignmentsQuery, [teacherId])
      console.log('🔍 DEBUG: Query executed successfully, result type:', typeof assignments)
    } catch (queryError) {
      console.error('🔍 DEBUG: Query execution failed:', queryError)
      console.error('🔍 DEBUG: Error details:', {
        message: queryError instanceof Error ? queryError.message : 'Unknown error',
        stack: queryError instanceof Error ? queryError.stack : 'No stack trace',
        teacherId: teacherId
      })
      return NextResponse.json({
        assignments: [],
        total: 0
      })
    }

    console.log('🔍 DEBUG: Assignments query result:', {
      type: typeof assignments,
      isArray: Array.isArray(assignments),
      length: assignments?.length,
      firstItem: assignments?.[0]
    })

    // Ensure assignments is an array
    if (!assignments) {
      console.error('Assignments query returned null/undefined')
      return NextResponse.json({
        assignments: [],
        total: 0
      })
    }

    // The executeQuery function already returns an array, no need for additional handling
    const transformedAssignments = assignments.map((assignment: any) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      due_at: assignment.due_at,
      created_at: assignment.created_at,
      stage_name: assignment.stage_name,
      target_students: assignment.target_students || 0,
      submissions_count: assignment.submissions_count || 0,
      graded_count: assignment.graded_count || 0,
      status: assignment.due_at && new Date(assignment.due_at) < new Date() ? 'overdue' : 'active'
    }))

    const response = {
      assignments: transformedAssignments,
      total: transformedAssignments.length
    }
    
    console.log('🔍 DEBUG: API Response:', {
      assignmentsCount: transformedAssignments.length,
      total: transformedAssignments.length,
      firstAssignment: transformedAssignments[0]
    })
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching teacher assignments:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      teacherId: user?.id || 'unknown'
    })
    return NextResponse.json(
            {
        error: 'فشل في تحميل الواجبات',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'database_connection_error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    let user;
    try {
      user = await getCurrentUser()
    } catch (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'خطأ في المصادقة - يرجى تسجيل الدخول مرة أخرى' }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    if (user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح - يجب أن تكون مدرس' }, { status: 403 })
    }

    const { title, description, due_at, stage_id, target_students } = await request.json()

    if (!title || !description || !stage_id) {
      return NextResponse.json({ error: 'البيانات المطلوبة غير مكتملة' }, { status: 400 })
    }

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Create assignment with UUID
    const assignmentId = uuidv4()
    await executeQuery(
      'INSERT INTO assignments (id, title, description, due_at, stage_id, teacher_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [assignmentId, title, description, due_at, stage_id, teacherRecordId]
    )

    // Assign students if specified
    if (target_students && Array.isArray(target_students) && target_students.length > 0) {
      for (const studentId of target_students) {
        try {
          await executeQuery(
            'INSERT INTO assignment_targets (assignment_id, student_id) VALUES (?, ?)',
            [assignmentId, studentId]
          )
        } catch (error) {
          console.error('Error assigning student to assignment:', error)
          // Continue with next student
        }
      }
    }

    return NextResponse.json({
      message: 'تم إنشاء الواجب بنجاح',
      assignment_id: assignmentId
    })

  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الواجب' },
      { status: 500 }
    )
  }
}
