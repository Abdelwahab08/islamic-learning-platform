import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    const certificatesQuery = `
      SELECT 
        c.id,
        c.serial,
        c.grade,
        c.issued_at,
        c.status,
        u.email as student_email,
        st.name_ar as stage_name
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN stages st ON c.stage_id = st.id
      WHERE t.user_id = ?
      ORDER BY c.issued_at DESC
    `

    const certificates = await executeQuery(certificatesQuery, [teacherId])

    const transformedCertificates = certificates.map((cert: any) => ({
      id: cert.id,
      serial_number: cert.serial,
      student_name: cert.student_email.split('@')[0],
      stage_name: cert.stage_name,
      grade: cert.grade,
      issue_date: cert.issued_at,
      status: cert.status,
      issued_at: cert.issued_at
    }))

    return NextResponse.json({
      certificates: transformedCertificates,
      total: transformedCertificates.length
    })

  } catch (error) {
    console.error('Error fetching teacher certificates:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الشهادات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const body = await request.json()

    // Validate required fields
    if (!body.student_id || !body.stage_id || !body.issue_date) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Verify student exists and is assigned to this teacher
    const studentCheck = await executeQuery(`
      SELECT s.id FROM students s
      JOIN teacher_students ts ON s.id = ts.student_id
      WHERE s.id = ? AND ts.teacher_id = ?
    `, [body.student_id, teacherRecordId])

    if (studentCheck.length === 0) {
      return NextResponse.json({ error: 'الطالب غير موجود أو غير مسجل لهذا المدرس' }, { status: 404 })
    }

    // Verify stage exists
    const stageCheck = await executeQuery('SELECT id FROM stages WHERE id = ?', [body.stage_id])
    if (stageCheck.length === 0) {
      return NextResponse.json({ error: 'المرحلة غير موجودة' }, { status: 404 })
    }

    // Generate UUID for certificate ID
    const certificateId = uuidv4()

    // Create certificate with PENDING status (needs admin approval)
    const result = await executeQuery(`
      INSERT INTO certificates (id, student_id, teacher_id, stage_id, grade, issued_at, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
    `, [
      certificateId,
      body.student_id,
      teacherRecordId,
      body.stage_id,
      body.grade || 'ممتاز',
      body.issue_date
    ])

    // Get the created certificate details
    const certificateQuery = `
      SELECT 
        c.id,
        c.serial,
        c.grade,
        c.issued_at,
        c.status,
        u.email as student_email,
        st.name_ar as stage_name
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN stages st ON c.stage_id = st.id
      WHERE c.id = ?
    `

    const certificate = await executeQuery(certificateQuery, [certificateId])

    if (certificate.length === 0) {
      return NextResponse.json({ error: 'فشل في إنشاء الشهادة' }, { status: 500 })
    }

    const createdCertificate = certificate[0]

    return NextResponse.json({
      message: 'تم إنشاء الشهادة بنجاح وإرسالها للمدير للموافقة',
      certificate: {
        id: createdCertificate.id,
        serial_number: createdCertificate.serial,
        student_name: createdCertificate.student_email.split('@')[0],
        stage_name: createdCertificate.stage_name,
        grade: createdCertificate.grade,
        status: createdCertificate.status,
        issued_at: createdCertificate.issued_at
      }
    })

  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الشهادة' },
      { status: 500 }
    )
  }
}
