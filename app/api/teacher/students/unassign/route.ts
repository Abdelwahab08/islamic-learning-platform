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

    // Resolve teacher_id
    let teacherId: string | null = null
    if (user.role === 'TEACHER') {
      const teacherRecord = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
      if (teacherRecord.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
      }
      teacherId = teacherRecord[0].id
    } else {
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

    await executeUpdate('DELETE FROM teacher_students WHERE teacher_id = ? AND student_id = ?', [teacherId, student_id])

    return NextResponse.json({ message: 'تم إلغاء إسناد الطالب بنجاح', teacher_id: teacherId, student_id })
  } catch (error) {
    console.error('❌ Error unassigning student from teacher:', error)
    return NextResponse.json({ error: 'فشل في إلغاء الإسناد' }, { status: 500 })
  }
}


