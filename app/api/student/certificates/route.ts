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

    // Get certificates for this student - returning exact structure frontend expects
    const certificates = await executeQuery(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.status,
        c.issued_at,
        u.email as teacher_email
      FROM certificates c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC
    `, [studentId])

    const transformedCertificates = certificates.map((cert: any, index: number) => ({
      id: cert.id,
      serialNumber: index + 1, // Generate serial number
      grade: 'ممتاز', // Default grade
      issueDate: cert.issued_at,
      status: cert.status,
      createdAt: cert.issued_at,
      teacherEmail: cert.teacher_email || 'غير محدد',
      stageName: 'المرحلة المتوسطة' // Default stage
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
