import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(
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
      return NextResponse.json({ error: 'المجموعة غير موجودة أو غير مصرح لك بعرضها' }, { status: 404 })
    }

    // Get students in this group
    const students = await executeQuery(`
      SELECT 
        s.id,
        s.user_id,
        u.email,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as name,
        gs.created_at as joined_at
      FROM group_students gs
      JOIN students s ON gs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE gs.group_id = ?
      ORDER BY gs.created_at DESC
    `, [params.id])

    return NextResponse.json({ students })

  } catch (error) {
    console.error('❌ Error fetching group students:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل طلاب المجموعة' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { student_id } = await request.json()

    if (!student_id) {
      return NextResponse.json({ error: 'معرف الطالب مطلوب' }, { status: 400 })
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
      'SELECT id, max_students FROM groups WHERE id = ? AND teacher_id = ?',
      [params.id, teacherId]
    )

    if (groupCheck.length === 0) {
      return NextResponse.json({ error: 'المجموعة غير موجودة أو غير مصرح لك بإضافة طلاب إليها' }, { status: 404 })
    }

    const group = groupCheck[0]

    // Check if student exists
    const studentCheck = await executeQuery(
      'SELECT id FROM students WHERE id = ?',
      [student_id]
    )

    if (studentCheck.length === 0) {
      return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 })
    }

    // Check if student is already in this group
    const existingMember = await executeQuery(
      'SELECT id FROM group_students WHERE group_id = ? AND student_id = ?',
      [params.id, student_id]
    )

    if (existingMember.length > 0) {
      return NextResponse.json({ error: 'الطالب موجود بالفعل في هذه المجموعة' }, { status: 400 })
    }

    // Check if group is full
    const currentStudents = await executeQuery(
      'SELECT COUNT(*) as count FROM group_students WHERE group_id = ?',
      [params.id]
    )

    if (currentStudents[0].count >= group.max_students) {
      return NextResponse.json({ error: 'المجموعة ممتلئة' }, { status: 400 })
    }

    // Add student to group
    await executeUpdate(`
      INSERT INTO group_students (id, group_id, student_id, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [uuidv4(), params.id, student_id])

    return NextResponse.json({
      message: 'تم إضافة الطالب للمجموعة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error adding student to group:', error)
    return NextResponse.json(
      { error: 'فشل في إضافة الطالب للمجموعة' },
      { status: 500 }
    )
  }
}
