import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

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

    // Get assignments for this student
    const assignments = await executeQuery(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.created_at,
        a.status,
        CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        u.email as teacher_email
      FROM assignments a
      LEFT JOIN users u ON a.teacher_id = u.id
      WHERE a.student_id = ?
      ORDER BY a.due_date ASC
    `, [studentId])

    const transformedAssignments = assignments.map((assignment: any) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.due_date,
      createdAt: assignment.created_at,
      status: assignment.status || 'PENDING',
      teacherName: assignment.teacher_name || 'غير محدد',
      teacherEmail: assignment.teacher_email || 'غير محدد'
    }))

    return NextResponse.json({ assignments: transformedAssignments })

  } catch (error) {
    console.error('Error fetching student assignments:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
