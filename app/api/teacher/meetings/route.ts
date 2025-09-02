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

    // Get real meetings from database
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

    return NextResponse.json({ meetings })

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

    // Combine date and time
    const scheduledAt = new Date(`${date}T${time}`)
    
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
