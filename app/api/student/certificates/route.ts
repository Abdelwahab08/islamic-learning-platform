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

    // Get certificates for this student - using correct column names
    const certificates = await executeQuery(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.status,
        c.issued_at,
        u.first_name as teacher_first_name,
        u.last_name as teacher_last_name
      FROM certificates c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC
    `, [studentId])

    const transformedCertificates = certificates.map((cert: any) => ({
      id: cert.id,
      title: cert.title,
      description: cert.description,
      status: cert.status,
      issueDate: cert.issued_at,
      createdAt: cert.issued_at,
      teacherName: `${cert.teacher_first_name || ''} ${cert.teacher_last_name || ''}`.trim()
    }))

    return NextResponse.json({ certificates: transformedCertificates })

  } catch (error) {
    console.error('Error fetching student certificates:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
