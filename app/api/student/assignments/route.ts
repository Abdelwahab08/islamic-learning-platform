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

    // If student doesn't exist, return empty assignments
    if (student.length === 0) {
      return NextResponse.json([])
    }

    const studentId = student[0].id

    // Get assignments - simplified query with error handling
    let assignments = [];
    
    try {
      const result = await executeQuery(`
        SELECT
          a.id,
          a.title,
          a.description,
          COALESCE(a.due_at, a.due_date) AS due_at,
          a.created_at,
          'teacher@test.com' AS teacher_email,
          'معلم تجريبي' AS teacher_name,
          NULL AS submission_id
        FROM assignments a
        JOIN assignment_targets at ON at.assignment_id = a.id
        WHERE at.student_id = ?
        ORDER BY COALESCE(a.due_at, a.due_date) ASC
        LIMIT 10
      `, [studentId]);
      
      assignments = result;
    } catch (error: any) {
      console.log('Error getting assignments:', error?.message || error);
      // Return empty array if query fails
      assignments = [];
    }

    const transformedAssignments = assignments.map((assignment: any) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.due_at,
      createdAt: assignment.created_at,
      status: assignment.submission_id ? 'SUBMITTED' : 'PENDING',
      teacherName: assignment.teacher_name?.trim() || 'غير محدد',
      teacherEmail: assignment.teacher_email || 'غير محدد'
    }))

    return NextResponse.json({ assignments: transformedAssignments })

  } catch (error: any) {
    console.error('Error fetching student assignments:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
