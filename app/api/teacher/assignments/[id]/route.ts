import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

// GET - Get assignment details
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

    const assignmentQuery = `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_at,
        a.created_at,
        st.name_ar as stage_name,
        st.id as stage_id,
        COUNT(DISTINCT COALESCE(at.student_id, sub.student_id)) as target_students,
        COUNT(DISTINCT sub.id) as submissions_count,
        COUNT(DISTINCT CASE WHEN sub.grade IS NOT NULL THEN sub.id END) as graded_count
      FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      LEFT JOIN stages st ON a.stage_id = st.id
      LEFT JOIN assignment_targets at ON a.id = at.assignment_id
      LEFT JOIN submissions sub ON a.id = sub.assignment_id
      WHERE t.user_id = ? AND a.id = ?
      GROUP BY a.id
    `

    console.log('🔍 DEBUG: Fetching assignment details for ID:', assignmentId)
    console.log('🔍 DEBUG: Teacher ID:', teacherId)
    
    const assignments = await executeQuery(assignmentQuery, [teacherId, assignmentId])
    
    console.log('🔍 DEBUG: Assignment query result:', assignments)
    
    if (assignments.length === 0) {
      return NextResponse.json({ error: 'الواجب غير موجود' }, { status: 404 })
    }

    const assignment = assignments[0]
    const transformedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      due_at: assignment.due_at,
      created_at: assignment.created_at,
      stage_name: assignment.stage_name,
      stage_id: assignment.stage_id,
      target_students: assignment.target_students || 0,
      submissions_count: assignment.submissions_count || 0,
      graded_count: assignment.graded_count || 0,
      status: assignment.due_at && new Date(assignment.due_at) < new Date() ? 'overdue' : 'active'
    }

    return NextResponse.json(transformedAssignment)

  } catch (error) {
    console.error('Error fetching assignment details:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Ensure we always return valid JSON
    return NextResponse.json(
            {
        error: 'فشل في تحميل تفاصيل الواجب',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'database_connection_error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update assignment
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

    // Verify teacher owns this assignment
    const ownershipQuery = `
      SELECT id FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      WHERE t.user_id = ? AND a.id = ?
    `
    const ownership = await executeQuery(ownershipQuery, [teacherId, assignmentId])
    
    if (ownership.length === 0) {
      return NextResponse.json({ error: 'الواجب غير موجود' }, { status: 404 })
    }

    // Update assignment
    const updateQuery = `
      UPDATE assignments 
      SET title = ?, description = ?, due_at = ?, stage_id = ?
      WHERE id = ?
    `
    await executeQuery(updateQuery, [
      body.title,
      body.description,
      body.due_at,
      body.stage_id,
      assignmentId
    ])

    return NextResponse.json({ message: 'تم تحديث الواجب بنجاح' })

  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الواجب' },
      { status: 500 }
    )
  }
}

// DELETE - Delete assignment
export async function DELETE(
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
      SELECT id FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      WHERE t.user_id = ? AND a.id = ?
    `
    const ownership = await executeQuery(ownershipQuery, [teacherId, assignmentId])
    
    if (ownership.length === 0) {
      return NextResponse.json({ error: 'الواجب غير موجود' }, { status: 404 })
    }

    // Delete assignment (cascade will handle related records)
    const deleteQuery = `DELETE FROM assignments WHERE id = ?`
    await executeQuery(deleteQuery, [assignmentId])

    return NextResponse.json({ message: 'تم حذف الواجب بنجاح' })

  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { error: 'فشل في حذف الواجب' },
      { status: 500 }
    )
  }
}
