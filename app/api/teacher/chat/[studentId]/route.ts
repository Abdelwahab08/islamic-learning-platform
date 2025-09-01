import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const studentId = params.studentId

    // Get teacher record ID
    const teacherRecord = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [user.id]
    )

    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    // Verify student is assigned to this teacher
    const assignment = await executeQuery(
      'SELECT id FROM teacher_students WHERE teacher_id = ? AND student_id = ?',
      [teacherId, studentId]
    )

    if (assignment.length === 0) {
      return NextResponse.json({ error: 'الطالب غير مسند لهذا المعلم' }, { status: 403 })
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
          WHEN m.sender_id = ? THEN 'TEACHER'
          ELSE 'STUDENT'
        END as sender_type
      FROM messages m
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [teacherId, teacherId, studentId, studentId, teacherId])

    // Mark messages from student as read
    await executeUpdate(`
      UPDATE messages 
      SET is_read = 1 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `, [studentId, teacherId])

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
