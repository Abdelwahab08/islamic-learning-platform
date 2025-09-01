import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
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

    // Get students assigned to this teacher
    const students = await executeQuery(`
      SELECT s.id FROM students s 
      JOIN teacher_students ts ON s.id = ts.student_id 
      WHERE ts.teacher_id = ? 
      LIMIT 3
    `, [teacherRecordId])

    if (students.length === 0) {
      return NextResponse.json({ error: 'لا يوجد طلاب مسجلين لهذا المدرس' }, { status: 404 })
    }

    // Get stages
    const stages = await executeQuery('SELECT id FROM stages LIMIT 3')
    if (stages.length === 0) {
      return NextResponse.json({ error: 'لا توجد مراحل متاحة' }, { status: 404 })
    }

    const createdCertificates = []

    // Create test certificates with different statuses
    const testCertificates = [
      {
        student_id: students[0].id,
        stage_id: stages[0].id,
        grade: 'ممتاز',
        status: 'PENDING'
      },
      {
        student_id: students[Math.min(1, students.length - 1)].id,
        stage_id: stages[Math.min(1, stages.length - 1)].id,
        grade: 'جيد جداً',
        status: 'APPROVED'
      },
      {
        student_id: students[Math.min(2, students.length - 1)].id,
        stage_id: stages[Math.min(2, stages.length - 1)].id,
        grade: 'جيد',
        status: 'REJECTED'
      }
    ]

    for (const cert of testCertificates) {
      try {
        const certificateId = uuidv4()
        const result = await executeQuery(`
          INSERT INTO certificates (id, student_id, teacher_id, stage_id, grade, issued_at, status)
          VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `, [
          certificateId,
          cert.student_id,
          teacherRecordId,
          cert.stage_id,
          cert.grade,
          cert.status
        ])

        createdCertificates.push({
          id: certificateId,
          status: cert.status,
          grade: cert.grade
        })
      } catch (error) {
        console.error('Error creating test certificate:', error)
      }
    }

    if (createdCertificates.length === 0) {
      return NextResponse.json({ 
        error: 'فشل في إنشاء أي شهادات تجريبية' 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: `تم إنشاء ${createdCertificates.length} شهادات تجريبية بنجاح`,
      certificates: createdCertificates,
      total: createdCertificates.length
    })

  } catch (error) {
    console.error('Error creating test certificates:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الشهادات التجريبية: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
