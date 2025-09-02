import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    if (teachers.length === 0) {
      return NextResponse.json({ meetings: [] })
    }
    const teacherRecordId = teachers[0].id

    // Get real meetings from database and map to frontend expected format
    const meetings = await executeQuery(`
      SELECT 
        m.*,
        u.email as teacher_name,
        COALESCE(st.name_ar, 'عام') as stage_name
      FROM meetings m
      JOIN teachers t ON m.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON m.level_stage_id = st.id
      WHERE m.teacher_id = ?
      ORDER BY m.scheduled_at DESC
    `, [teacherRecordId])

    // Map database fields to frontend expected format
    const mappedMeetings = meetings.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      description: '', // Not stored in database
      date: meeting.scheduled_at ? new Date(meeting.scheduled_at).toISOString().split('T')[0] : '',
      time: meeting.scheduled_at ? new Date(meeting.scheduled_at).toTimeString().slice(0, 5) : '',
      duration: meeting.duration_minutes || 60,
      max_participants: 20, // Default value
      current_participants: 0, // Default value
      meeting_type: meeting.provider || 'AGORA',
      status: meeting.status || 'scheduled',
      group_id: meeting.group_id,
      stage_id: meeting.level_stage_id
    }))

    return NextResponse.json({ meetings: mappedMeetings })

  } catch (error) {
    console.error('Error fetching teacher meetings:', error)
    return NextResponse.json({ meetings: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    const body = await request.json()
    const { title, description, date, time, duration, meeting_type, group_id, stage_id } = body

    if (!title || !date || !time || !duration) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // Combine date and time with proper validation
    let scheduledAt: Date
    try {
      scheduledAt = new Date(`${date}T${time}`)
      if (isNaN(scheduledAt.getTime())) {
        return NextResponse.json({ error: 'تاريخ أو وقت غير صحيح' }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'تاريخ أو وقت غير صحيح' }, { status: 400 })
    }
    
    // Generate join URL
    const joinUrl = `https://meet.google.com/${uuidv4().replace(/-/g, '').substring(0, 12)}`

    // Save to database
    const meetingId = uuidv4()
    await executeQuery(`
      INSERT INTO meetings (id, teacher_id, title, scheduled_at, duration_minutes, provider, level_stage_id, group_id, join_url, status, record)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', 0)
    `, [
      meetingId,
      teacherRecordId,
      title,
      scheduledAt,
      duration,
      meeting_type || 'AGORA',
      stage_id || null,
      group_id || null,
      joinUrl
    ])

    // Get the created meeting
    const createdMeeting = await executeQuery(`
      SELECT 
        m.*,
        u.email as teacher_name,
        COALESCE(st.name_ar, 'عام') as stage_name
      FROM meetings m
      JOIN teachers t ON m.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON m.level_stage_id = st.id
      WHERE m.id = ?
    `, [meetingId])

    return NextResponse.json({
      message: 'تم إنشاء الاجتماع بنجاح',
      meeting: createdMeeting[0]
    })

  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الاجتماع' },
      { status: 500 }
    )
  }
}
