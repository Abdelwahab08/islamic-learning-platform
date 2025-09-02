import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teacherRecord = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [user.id]
    )

    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    // Check if group belongs to this teacher
    const groupCheck = await executeQuery(
      'SELECT id FROM `groups` WHERE id = ? AND teacher_id = ?',
      [params.id, teacherId]
    )

    if (groupCheck.length === 0) {
      return NextResponse.json({ error: 'المجموعة غير موجودة أو غير مصرح لك بإزالة طلاب منها' }, { status: 404 })
    }

    // Check if student is in this group
    const memberCheck = await executeQuery(
      'SELECT id FROM group_students WHERE group_id = ? AND student_id = ?',
      [params.id, params.studentId]
    )

    if (memberCheck.length === 0) {
      return NextResponse.json({ error: 'الطالب غير موجود في هذه المجموعة' }, { status: 404 })
    }

    // Remove student from group
    await executeUpdate(
      'DELETE FROM group_students WHERE group_id = ? AND student_id = ?',
      [params.id, params.studentId]
    )

    return NextResponse.json({
      message: 'تم إزالة الطالب من المجموعة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error removing student from group:', error)
    return NextResponse.json(
      { error: 'فشل في إزالة الطالب من المجموعة' },
      { status: 500 }
    )
  }
}
