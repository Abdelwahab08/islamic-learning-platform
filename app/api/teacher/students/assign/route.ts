import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { student_id } = await request.json()
    if (!student_id) {
      return NextResponse.json({ error: 'student_id مطلوب' }, { status: 400 })
    }

    // Resolve teacher_id from current user unless ADMIN supplies a teacher_id in body
    let teacherId: string | null = null
    if (user.role === 'TEACHER') {
      const teacherRecord = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
      if (teacherRecord.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
      }
      teacherId = teacherRecord[0].id
    } else {
      // ADMIN path: accept teacher_id in body or resolve by email
      const body: any = await request.json()
      if (body.teacher_id) {
        teacherId = body.teacher_id
      } else if (body.teacher_email) {
        const tr = await executeQuery(`SELECT t.id FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.email = ?`, [body.teacher_email])
        if (tr.length === 0) return NextResponse.json({ error: 'Teacher email غير موجود' }, { status: 404 })
        teacherId = tr[0].id
      } else {
        return NextResponse.json({ error: 'teacher_id أو teacher_email مطلوب للمدير' }, { status: 400 })
      }
    }

    // Validate student exists
    const student = await executeQuery('SELECT id FROM students WHERE id = ?', [student_id])
    if (student.length === 0) {
      return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 })
    }

    // Upsert link (unique on (teacher_id, student_id) recommended)
    // Try insert; if duplicate, treat as success
    try {
      await executeUpdate(
        'INSERT INTO teacher_students (id, teacher_id, student_id, created_at) VALUES (UUID(), ?, ?, NOW())',
        [teacherId, student_id]
      )
    } catch (e: any) {
      const msg = e?.message || ''
      if (!/Duplicate entry|uq_teacher_student/.test(msg)) {
        throw e
      }
    }

    return NextResponse.json({ message: 'تم إسناد الطالب للمعلم بنجاح', teacher_id: teacherId, student_id })
  } catch (error) {
    console.error('❌ Error assigning student to teacher:', error)
    return NextResponse.json({ error: 'فشل في إسناد الطالب' }, { status: 500 })
  }
}


