import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { createNotificationFromTemplate, notificationTemplates } from '@/lib/notifications'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const message = formData.get('message') as string || 'تسجيل صوتي جديد'

    if (!audioFile) {
      return NextResponse.json({ error: 'ملف الصوت مطلوب' }, { status: 400 })
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

    // Get assigned teacher
    const teacherAssignment = await executeQuery(`
      SELECT t.id as teacher_id, t.user_id as teacher_user_id
      FROM teacher_students ts
      JOIN teachers t ON ts.teacher_id = t.id
      WHERE ts.student_id = ?
      LIMIT 1
    `, [studentId])

    if (teacherAssignment.length === 0) {
      return NextResponse.json({ error: 'لا يوجد معلم مسند لك' }, { status: 404 })
    }

    const teacherId = teacherAssignment[0].teacher_id
    const teacherUserId = teacherAssignment[0].teacher_user_id

    // Generate unique filename
    const fileExtension = audioFile.name.split('.').pop() || 'webm'
    const fileName = `voice_${uuidv4()}.${fileExtension}`
    
    // Save audio file to public/uploads/voice directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'voice')
    const filePath = join(uploadDir, fileName)
    
    // Convert File to Buffer and save
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create voice submission record
    const submissionId = uuidv4()
    const audioUrl = `/uploads/voice/${fileName}`
    
    await executeUpdate(`
      INSERT INTO voice_submissions (id, student_id, teacher_id, audio_url, message, submitted_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [submissionId, studentId, teacherId, audioUrl, message])

    // Create notification for teacher
    try {
      await createNotificationFromTemplate(
        teacherUserId,
        notificationTemplates.teacher.voiceSubmission(user.email, message)
      )
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the submission if notification fails
    }

    return NextResponse.json({
      message: 'تم إرسال التسجيل الصوتي بنجاح',
      submission_id: submissionId,
      audio_url: audioUrl
    })

  } catch (error) {
    console.error('❌ Error submitting voice recording:', error)
    return NextResponse.json(
      { error: 'فشل في إرسال التسجيل الصوتي' },
      { status: 500 }
    )
  }
}
