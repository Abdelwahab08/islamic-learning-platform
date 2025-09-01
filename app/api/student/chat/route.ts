import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { createNotificationFromTemplate, notificationTemplates } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get student record ID
    const studentRecord = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (studentRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات الطالب' }, { status: 404 })
    }

    const studentId = studentRecord[0].id

    // Get assigned teacher with latest message
    const teacher = await executeQuery(`
      SELECT 
        t.id as teacher_id,
        u.email as teacher_email,
        (
          SELECT m.content 
          FROM messages m 
          WHERE (m.sender_id = t.id AND m.receiver_id = ?) 
             OR (m.sender_id = ? AND m.receiver_id = t.id)
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m.created_at 
          FROM messages m 
          WHERE (m.sender_id = t.id AND m.receiver_id = ?) 
             OR (m.sender_id = ? AND m.receiver_id = t.id)
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.sender_id = t.id 
            AND m.receiver_id = ? 
            AND m.is_read = 0
        ) as unread_count
      FROM teacher_students ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE ts.student_id = ?
      LIMIT 1
    `, [studentId, studentId, studentId, studentId, studentId, studentId])

    if (teacher.length === 0) {
      return NextResponse.json({ 
        teacher: null,
        message: 'لا يوجد معلم مسند لك حالياً'
      })
    }

    const teacherData = teacher[0]
    const transformedTeacher = {
      id: teacherData.teacher_id,
      email: teacherData.teacher_email,
      lastMessage: teacherData.last_message || 'لا توجد رسائل',
      lastMessageTime: teacherData.last_message_time || null,
      unreadCount: teacherData.unread_count || 0
    }

    return NextResponse.json({ teacher: transformedTeacher })

  } catch (error) {
    console.error('❌ Error fetching student chat:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل بيانات الشات' },
      { status: 500 }
    )
  }
}

// Students can only view messages, not send them
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'الطلاب لا يمكنهم إرسال رسائل' },
    { status: 403 }
  )
}
