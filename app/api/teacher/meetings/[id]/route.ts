import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const meetingId = params.id

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Verify meeting ownership
    const meetingCheck = await executeQuery(
      'SELECT id FROM meetings WHERE id = ? AND teacher_id = ?',
      [meetingId, teacherRecordId]
    )
    
    if (meetingCheck.length === 0) {
      return NextResponse.json({ error: 'الاجتماع غير موجود أو غير مصرح بتعديله' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, date, time, duration, meeting_type, group_id, stage_id } = body

    if (!title || !date || !time || !duration) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // Combine date and time
    const scheduledAt = new Date(`${date}T${time}`)

    // Update meeting
    await executeQuery(`
      UPDATE meetings 
      SET title = ?, scheduled_at = ?, duration_minutes = ?, provider = ?, level_stage_id = ?, group_id = ?
      WHERE id = ?
    `, [
      title,
      scheduledAt,
      duration,
      meeting_type || 'AGORA',
      stage_id || null,
      group_id || null,
      meetingId
    ])

    return NextResponse.json({
      message: 'تم تحديث الاجتماع بنجاح'
    })

  } catch (error) {
    console.error('Error updating meeting:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الاجتماع' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    const meetingId = params.id

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Verify meeting ownership
    const meetingCheck = await executeQuery(
      'SELECT id, status FROM meetings WHERE id = ? AND teacher_id = ?',
      [meetingId, teacherRecordId]
    )
    
    if (meetingCheck.length === 0) {
      return NextResponse.json({ error: 'الاجتماع غير موجود أو غير مصرح بتعديله' }, { status: 404 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'start') {
      // Start meeting - update status to active
      await executeQuery(
        'UPDATE meetings SET status = ? WHERE id = ?',
        ['active', meetingId]
      )
      
      return NextResponse.json({
        message: 'تم بدء الاجتماع بنجاح'
      })
    } else if (action === 'cancel') {
      // Cancel meeting - update status to cancelled
      await executeQuery(
        'UPDATE meetings SET status = ? WHERE id = ?',
        ['cancelled', meetingId]
      )
      
      return NextResponse.json({
        message: 'تم إلغاء الاجتماع بنجاح'
      })
    } else {
      return NextResponse.json({ error: 'إجراء غير صحيح' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error updating meeting status:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث حالة الاجتماع' },
      { status: 500 }
    )
  }
}
