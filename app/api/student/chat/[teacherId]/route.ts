import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = params.teacherId

    // Get student record ID
    const studentRecord = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (studentRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات الطالب' }, { status: 404 })
    }

    const studentId = studentRecord[0].id

    // Verify teacher is assigned to this student
    const assignment = await executeQuery(
      'SELECT id FROM teacher_students WHERE teacher_id = ? AND student_id = ?',
      [teacherId, studentId]
    )

    if (assignment.length === 0) {
      return NextResponse.json({ error: 'المعلم غير مسند لهذا الطالب' }, { status: 403 })
    }

    // Get messages between teacher and student
    const messages = await executeQuery(`
      SELECT 
        m.id,
        m.content,
        m.message_type,
        m.created_at,
        m.is_read,
        CASE 
          WHEN m.sender_id = ? THEN 'STUDENT'
          ELSE 'TEACHER'
        END as sender_type
      FROM messages m
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [studentId, studentId, teacherId, teacherId, studentId])

    // Mark messages from teacher as read
    await executeUpdate(`
      UPDATE messages 
      SET is_read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `, [teacherId, studentId])

    const transformedMessages = messages.map((message: any) => ({
      id: message.id,
      content: message.content,
      messageType: message.message_type,
      createdAt: message.created_at,
      isRead: message.is_read,
      senderType: message.sender_type
    }))

    return NextResponse.json({ messages: transformedMessages })

  } catch (error) {
    console.error('❌ Error fetching messages:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الرسائل' },
      { status: 500 }
    )
  }
}
