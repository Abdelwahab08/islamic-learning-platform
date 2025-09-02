import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teacherEmail = searchParams.get('teacherEmail') || ''
    const studentEmail = searchParams.get('studentEmail') || ''

    if (!teacherEmail || !studentEmail) {
      return NextResponse.json({ error: 'teacherEmail و studentEmail مطلوبان' }, { status: 400 })
    }

    // Resolve teacher user and teacher record
    const teacherUser = await executeQuery(
      'SELECT id FROM users WHERE email = ? AND role = "TEACHER"',
      [teacherEmail]
    )
    if (teacherUser.length === 0) {
      return NextResponse.json({ error: 'حساب المعلم غير موجود' }, { status: 404 })
    }
    const teacherUserId = teacherUser[0].id

    const teacherRecord = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [teacherUserId]
    )
    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'سجل المعلم غير موجود في جدول teachers' }, { status: 404 })
    }
    const teacherId = teacherRecord[0].id

    // Resolve student user and student record
    const studentUser = await executeQuery(
      'SELECT id FROM users WHERE email = ? AND role = "STUDENT"',
      [studentEmail]
    )
    if (studentUser.length === 0) {
      return NextResponse.json({ error: 'حساب الطالب غير موجود' }, { status: 404 })
    }
    const studentUserId = studentUser[0].id

    const studentRecord = await executeQuery(
      'SELECT id, current_stage_id, current_page FROM students WHERE user_id = ?',
      [studentUserId]
    )
    if (studentRecord.length === 0) {
      return NextResponse.json({ error: 'سجل الطالب غير موجود في جدول students' }, { status: 404 })
    }
    const studentId = studentRecord[0].id

    // Check teacher_students link
    const link = await executeQuery(
      'SELECT id, teacher_id, student_id, assigned_at FROM teacher_students WHERE teacher_id = ? AND student_id = ?',
      [teacherId, studentId]
    )

    // Also show any suspicious rows (teacher_id stored as user_id)
    const altLink = await executeQuery(
      'SELECT id, teacher_id, student_id, assigned_at FROM teacher_students WHERE teacher_id = ? AND student_id = ?',
      [teacherUserId, studentId]
    )

    return NextResponse.json({
      input: { teacherEmail, studentEmail },
      resolved: {
        teacherUserId,
        teacherId,
        studentUserId,
        studentId,
      },
      linkExists: link.length > 0,
      link,
      alternativeLinkUsingTeacherUserId: altLink,
    })
  } catch (error) {
    console.error('Error verifying assignment:', error)
    return NextResponse.json({ error: 'فشل التحقق' }, { status: 500 })
  }
}


