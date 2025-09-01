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

    // Get student record ID
    const student = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (student.length === 0) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات الطالب' },
        { status: 404 }
      )
    }

    const studentId = student[0].id

    // Get assignments for this student via assignment_targets; support due_at/due_date and teacher join via teachers->users
    const assignments = await executeQuery(`
      SELECT
        a.id,
        a.title,
        a.description,
        COALESCE(a.due_at, a.due_date) AS due_at,
        a.created_at,
        uu.email AS teacher_email,
        CONCAT(COALESCE(uu.first_name, ''), ' ', COALESCE(uu.last_name, '')) AS teacher_name,
        s.id AS submission_id
      FROM assignments a
      JOIN assignment_targets at ON at.assignment_id = a.id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      LEFT JOIN users uu ON (t.user_id = uu.id OR a.teacher_id = uu.id)
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = at.student_id
      WHERE at.student_id = ?
      ORDER BY COALESCE(a.due_at, a.due_date) ASC
    `, [studentId])

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
