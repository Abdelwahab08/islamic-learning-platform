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

    // Get certificates for this student
    const certificates = await executeQuery(`
      SELECT 
        c.id,
        c.serial,
        c.grade,
        c.issued_at,
        c.status,
        u.email as teacher_email,
        st.name_ar as stage_name
      FROM certificates c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON c.stage_id = st.id
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC
    `, [studentId])

    const transformedCertificates = certificates.map((cert: any) => ({
      id: cert.id,
      serialNumber: cert.serial,
      grade: cert.grade,
      issueDate: cert.issued_at,
      status: cert.status,
      createdAt: cert.issued_at, // Use issued_at as createdAt since created_at doesn't exist
      teacherEmail: cert.teacher_email,
      stageName: cert.stage_name
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
