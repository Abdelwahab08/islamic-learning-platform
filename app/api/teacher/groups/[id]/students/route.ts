import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// Temporary: Skip authentication for testing
const SKIP_AUTH = true

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporary: Skip authentication
    if (!SKIP_AUTH) {
      // Authentication logic would go here
    }

    // Get students in this group
    const students = await executeQuery(`
      SELECT 
        s.id,
        s.user_id,
        u.email,
        COALESCE(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')), u.email) as name
      FROM group_members gm
      JOIN students s ON gm.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.id DESC
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
    // Temporary: Skip authentication
    if (!SKIP_AUTH) {
      // Authentication logic would go here
    }

    const { student_id } = await request.json()

    if (!student_id) {
      return NextResponse.json({ error: 'معرف الطالب مطلوب' }, { status: 400 })
    }

    // For testing, use a hardcoded teacher ID
    const teacherId = 'test-teacher-1756745498806'

    // Check if group exists
    const groupCheck = await executeQuery(
      'SELECT id, max_students FROM groups WHERE id = ?',
      [params.id]
    )

    if (groupCheck.length === 0) {
      return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 })
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
      'SELECT id FROM group_members WHERE group_id = ? AND student_id = ?',
      [params.id, student_id]
    )

    if (existingMember.length > 0) {
      return NextResponse.json({ error: 'الطالب موجود بالفعل في هذه المجموعة' }, { status: 400 })
    }

    // Check if group is full
    const currentStudents = await executeQuery(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
      [params.id]
    )

    if (currentStudents[0].count >= group.max_students) {
      return NextResponse.json({ error: 'المجموعة ممتلئة' }, { status: 500 })
    }

    // Add student to group - removed created_at since it doesn't exist in schema
    const groupMemberId = uuidv4()
    await executeUpdate(`
      INSERT INTO group_members (id, group_id, student_id)
      VALUES (?, ?, ?)
    `, [groupMemberId, params.id, student_id])

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
