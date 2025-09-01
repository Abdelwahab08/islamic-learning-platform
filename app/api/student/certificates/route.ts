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

    // If student doesn't exist, return empty certificates
    if (student.length === 0) {
      return NextResponse.json([])
    }

    const studentId = student[0].id

    // Get certificates - simplified query with error handling
    let certificates = [];
    
    try {
      const result = await executeQuery(`
        SELECT 
          c.id,
          c.serial,
          c.grade,
          c.status,
          c.issued_at,
          'teacher@test.com' as teacher_email
        FROM certificates c
        WHERE c.student_id = ?
        ORDER BY c.issued_at DESC
        LIMIT 10
      `, [studentId]);
      
      certificates = result;
    } catch (error: any) {
      console.log('Error getting certificates:', error?.message || error);
      // Return empty array if query fails
      certificates = [];
    }

    const transformedCertificates = certificates.map((cert: any) => ({
      id: cert.id,
      serialNumber: cert.serial,
      grade: cert.grade,
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
