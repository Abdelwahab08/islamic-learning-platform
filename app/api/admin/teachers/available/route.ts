import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get all approved teachers with their student count
    const teachersQuery = `
      SELECT 
        t.id,
        u.email as name,
        u.email,
        COUNT(ts.student_id) as assigned_students,
        t.verified
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN teacher_students ts ON t.id = ts.teacher_id
      WHERE u.role = 'TEACHER' AND u.is_approved = 1
      GROUP BY t.id
      ORDER BY u.email
    `

    const teachers = await executeQuery(teachersQuery)

    const transformedTeachers = teachers.map((teacher: any) => ({
      id: teacher.id,
      name: teacher.name || 'معلم غير محدد',
      email: teacher.email || 'غير متوفر',
      assigned_students: teacher.assigned_students || 0,
      verified: teacher.verified || false
    }))

    return NextResponse.json({
      teachers: transformedTeachers,
      total: transformedTeachers.length
    })

  } catch (error) {
    console.error('❌ Error fetching available teachers:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل المعلمين المتاحين' },
      { status: 500 }
    )
  }
}
