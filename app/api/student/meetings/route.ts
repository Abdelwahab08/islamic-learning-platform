import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get student record ID and current stage
    const student = await executeQuery(
      'SELECT id, current_stage_id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (student.length === 0) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات الطالب' },
        { status: 404 }
      )
    }

    const studentId = student[0].id
    const currentStageId = student[0].current_stage_id

    // Get meetings for this student's stage and groups
    const meetings = await executeQuery(`
      SELECT DISTINCT
        m.id,
        m.title,
        m.description,
        m.scheduled_at,
        m.duration_minutes,
        m.meeting_type,
        m.status,
        m.created_at,
        u.email as teacher_email,
        st.name_ar as stage_name,
        g.name as group_name
      FROM meetings m
      LEFT JOIN teachers t ON m.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON m.level_stage_id = st.id
      LEFT JOIN groups g ON m.group_id = g.id
      LEFT JOIN group_members gm ON m.group_id = gm.group_id
      WHERE (m.level_stage_id = ? OR gm.student_id = ?)
      ORDER BY m.scheduled_at ASC
    `, [currentStageId, studentId])

    const transformedMeetings = meetings.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      scheduledAt: meeting.scheduled_at,
      durationMinutes: meeting.duration_minutes,
      meetingType: meeting.meeting_type,
      status: meeting.status,
      createdAt: meeting.created_at,
      teacherEmail: meeting.teacher_email,
      stageName: meeting.stage_name,
      groupName: meeting.group_name
    }))

    return NextResponse.json({ meetings: transformedMeetings })

  } catch (error) {
    console.error('Error fetching student meetings:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
