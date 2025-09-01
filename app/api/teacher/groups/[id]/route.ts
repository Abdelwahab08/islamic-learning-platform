import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { name, description, max_students } = await request.json()

    if (!name || !max_students) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    if (max_students < 1 || max_students > 50) {
      return NextResponse.json({ error: 'عدد الطلاب يجب أن يكون بين 1 و 50' }, { status: 400 })
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
      'SELECT id FROM groups WHERE id = ? AND teacher_id = ?',
      [params.id, teacherId]
    )

    if (groupCheck.length === 0) {
      return NextResponse.json({ error: 'المجموعة غير موجودة أو غير مصرح لك بتعديلها' }, { status: 404 })
    }

    // Update the group
    await executeUpdate(`
      UPDATE groups 
      SET name = ?, description = ?, max_students = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description || '', max_students, params.id])

    return NextResponse.json({
      message: 'تم تحديث المجموعة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error updating group:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث المجموعة' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      'SELECT id FROM groups WHERE id = ? AND teacher_id = ?',
      [params.id, teacherId]
    )

    if (groupCheck.length === 0) {
      return NextResponse.json({ error: 'المجموعة غير موجودة أو غير مصرح لك بحذفها' }, { status: 404 })
    }

    // Delete group members first
    await executeUpdate('DELETE FROM group_members WHERE group_id = ?', [params.id])

    // Delete the group
    await executeUpdate('DELETE FROM groups WHERE id = ?', [params.id])

    return NextResponse.json({
      message: 'تم حذف المجموعة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting group:', error)
    return NextResponse.json(
      { error: 'فشل في حذف المجموعة' },
      { status: 500 }
    )
  }
}
