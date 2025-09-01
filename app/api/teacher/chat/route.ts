import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { createNotificationFromTemplate, notificationTemplates } from '@/lib/notifications'

export async function GET(request: NextRequest) {
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

    // Get assigned students with their latest messages
    const students = await executeQuery(`
      SELECT 
        s.id as student_id,
        u.email as student_email,
        st.name_ar as stage_name,
        (
          SELECT m.content 
          FROM messages m 
          WHERE (m.sender_id = s.id AND m.receiver_id = ?) 
             OR (m.sender_id = ? AND m.receiver_id = s.id)
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at 
          FROM messages m 
          WHERE (m.sender_id = s.id AND m.receiver_id = ?) 
             OR (m.sender_id = ? AND m.receiver_id = s.id)
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.sender_id = s.id 
            AND m.receiver_id = ? 
            AND m.is_read = 0
        ) as unread_count
      FROM teacher_students ts
      JOIN students s ON ts.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stages st ON s.current_stage_id = st.id
      WHERE ts.teacher_id = ?
      ORDER BY last_message_time DESC
    `, [teacherId, teacherId, teacherId, teacherId, teacherId, teacherId])

    const transformedStudents = students.map((student: any) => ({
      id: student.student_id,
      email: student.student_email,
      stageName: student.stage_name || 'غير محدد',
      lastMessage: student.last_message || 'لا توجد رسائل',
      lastMessageTime: student.last_message_time || null,
      unreadCount: student.unread_count || 0
    }))

    return NextResponse.json({ students: transformedStudents })

  } catch (error) {
    console.error('❌ Error fetching chat students:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل قائمة الطلاب' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { studentId, content } = await request.json()

    if (!studentId || !content) {
      return NextResponse.json({ error: 'معرف الطالب والمحتوى مطلوبان' }, { status: 400 })
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

    // Verify student is assigned to this teacher
    const assignment = await executeQuery(
      'SELECT id FROM teacher_students WHERE teacher_id = ? AND student_id = ?',
      [teacherId, studentId]
    )

    if (assignment.length === 0) {
      return NextResponse.json({ error: 'الطالب غير مسند لهذا المعلم' }, { status: 403 })
    }

    // Create message
    const messageId = uuidv4()
    await executeUpdate(`
      INSERT INTO messages (id, sender_id, receiver_id, content, message_type, created_at)
      VALUES (?, ?, ?, ?, 'TEXT', CURRENT_TIMESTAMP)
    `, [messageId, teacherId, studentId, content])

    // Get student's user ID for notification
    const studentUser = await executeQuery(
      'SELECT user_id FROM students WHERE id = ?',
      [studentId]
    )

    if (studentUser.length > 0) {
      const studentUserId = studentUser[0].user_id
      
      // Create notification for student
      try {
        await createNotificationFromTemplate(
          studentUserId,
          notificationTemplates.student.newMessage(user.email, content.substring(0, 50))
        )
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError)
        // Don't fail the message sending if notification fails
      }
    }

    return NextResponse.json({
      message: 'تم إرسال الرسالة بنجاح',
      messageId
    })

  } catch (error) {
    console.error('❌ Error sending message:', error)
    return NextResponse.json(
      { error: 'فشل في إرسال الرسالة' },
      { status: 500 }
    )
  }
}
