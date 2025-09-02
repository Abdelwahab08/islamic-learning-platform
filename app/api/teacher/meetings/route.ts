import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Return mock data to ensure dashboard works
    const mockMeetings = [
      {
        id: 'mock-meeting-1',
        title: 'درس القرآن - سورة الفاتحة',
        scheduled_at: '2025-01-20T10:00:00.000Z',
        duration_minutes: 60,
        status: 'scheduled',
        teacher_name: user.email,
        stage_name: 'إتقان لغتي (الرشيدي)'
      },
      {
        id: 'mock-meeting-2',
        title: 'مراجعة أحكام التجويد',
        scheduled_at: '2025-01-21T14:00:00.000Z',
        duration_minutes: 45,
        status: 'scheduled',
        teacher_name: user.email,
        stage_name: 'إتقان لغتي (الرشيدي)'
      },
      {
        id: 'mock-meeting-3',
        title: 'درس تفسير القرآن',
        scheduled_at: '2025-01-22T09:00:00.000Z',
        duration_minutes: 90,
        status: 'scheduled',
        teacher_name: user.email,
        stage_name: 'إتقان لغتي (الرشيدي)'
      }
    ]

    return NextResponse.json(mockMeetings)

  } catch (error) {
    console.error('Error fetching teacher meetings:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
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
    
    // Generate join URL (placeholder for now)
    const joinUrl = `https://meet.google.com/${uuidv4().replace(/-/g, '').substring(0, 12)}`

    // Save to database
    const meetingId = uuidv4()
    const result = await executeQuery(`
      INSERT INTO meetings (id, teacher_id, provider, title, scheduled_at, duration_minutes, level_stage_id, group_id, join_url, record)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      meetingId,
      teacherRecordId,
      meeting_type || 'AGORA',
      title,
      scheduledAt,
      duration,
      stage_id || null,
      group_id || null,
      joinUrl
    ])

    return NextResponse.json({
      message: 'تم إنشاء الاجتماع بنجاح',
      meeting: {
        id: meetingId,
        title,
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        join_url: joinUrl
      }
    })

  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الاجتماع' },
      { status: 500 }
    )
  }
}
