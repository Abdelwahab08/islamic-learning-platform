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

    const teacherId = user.id
    console.log('🔍 Current user ID:', teacherId)

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    console.log('🔍 Teachers found:', teachers)
    
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id
    console.log('🔍 Teacher record ID:', teacherRecordId)

    // Check if lessons table exists
    try {
      const [tables] = await executeQuery('SHOW TABLES LIKE "lessons"')
      if (tables.length === 0) {
        console.log('❌ Lessons table does not exist')
        return NextResponse.json({
          schedule: [],
          total: 0,
          message: 'جدول الحصص غير موجود'
        })
      }
    } catch (error) {
      console.log('❌ Error checking lessons table:', error)
      return NextResponse.json({
        schedule: [],
        total: 0,
        message: 'خطأ في التحقق من جدول الحصص'
      })
    }

    // Get all lessons for this teacher - SIMPLIFIED VERSION
    try {
      const simpleQuery = `
        SELECT 
          id,
          day_of_week,
          start_time,
          subject,
          duration_minutes,
          room,
          group_id
        FROM lessons 
        WHERE teacher_id = ?
        ORDER BY 
          CASE day_of_week
            WHEN 'monday' THEN 1
            WHEN 'tuesday' THEN 2
            WHEN 'wednesday' THEN 3
            WHEN 'thursday' THEN 4
            WHEN 'friday' THEN 5
            WHEN 'saturday' THEN 6
            WHEN 'sunday' THEN 7
          END,
          start_time
      `

      const lessons = await executeQuery(simpleQuery, [teacherRecordId])
      console.log('🔍 Simple query lessons:', lessons)

      // Also get groups for this teacher to map group names
      const groups = await executeQuery('SELECT id, name FROM `groups` WHERE teacher_id = ?', [teacherRecordId])
      console.log('🔍 Groups for mapping:', groups)

      const transformedLessons = lessons.map((lesson: any) => ({
        id: lesson.id,
        day: lesson.day_of_week,
        time: lesson.start_time,
        subject: lesson.subject,
        group_name: lesson.group_id ? `المجموعة ${lesson.group_id}` : 'غير محدد',
        duration: lesson.duration_minutes,
        room: lesson.room
      }))

      console.log('🔍 Transformed lessons:', transformedLessons)

      return NextResponse.json({
        schedule: transformedLessons,
        groups: groups, // Include groups for frontend mapping
        total: transformedLessons.length
      })

    } catch (error) {
      console.error('❌ Error fetching lessons:', error)
      return NextResponse.json({
        schedule: [],
        groups: [],
        total: 0,
        error: 'فشل في تحميل الحصص'
      })
    }

  } catch (error) {
    console.error('❌ Error in lessons GET:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الجدول الزمني' },
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

    const teacherId = user.id
    console.log('🔍 Creating lesson for user ID:', teacherId)

    // Get teacher record
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id
    console.log('🔍 Using teacher record ID:', teacherRecordId)

    const body = await request.json()
    const { day_of_week, start_time, subject, duration_minutes, room, group_id } = body

    if (!day_of_week || !start_time || !subject || !duration_minutes) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // Validate day of week
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    if (!validDays.includes(day_of_week)) {
      return NextResponse.json({ error: 'يوم غير صحيح' }, { status: 400 })
    }

    // Check if lessons table exists
    try {
      const [tables] = await executeQuery('SHOW TABLES LIKE "lessons"')
      if (tables.length === 0) {
        return NextResponse.json({ 
          error: 'جدول الحصص غير موجود. يرجى إنشاء الجدول أولاً.',
          instructions: 'قم بتشغيل SQL script: create-lessons-table.sql في phpMyAdmin'
        }, { status: 500 })
      }
    } catch (error) {
      return NextResponse.json({ 
        error: 'خطأ في التحقق من جدول الحصص',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // Try to create the lesson
    try {
      // Check for time conflicts
      const conflictQuery = `
        SELECT id FROM lessons 
        WHERE teacher_id = ? AND day_of_week = ? AND start_time = ?
      `
      const conflicts = await executeQuery(conflictQuery, [teacherRecordId, day_of_week, start_time])
      
      if (conflicts.length > 0) {
        return NextResponse.json({ error: 'يوجد تعارض في الوقت مع حصة أخرى' }, { status: 400 })
      }

      // Save to database
      const lessonId = uuidv4()
      console.log('🔍 Creating lesson with ID:', lessonId)
      console.log('🔍 Lesson data:', { teacherRecordId, day_of_week, start_time, subject, duration_minutes, room, group_id })
      
      const result = await executeQuery(`
        INSERT INTO lessons (id, teacher_id, day_of_week, start_time, subject, duration_minutes, room, group_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        lessonId,
        teacherRecordId,
        day_of_week,
        start_time,
        subject,
        duration_minutes,
        room || null,
        group_id || null
      ])

      console.log('✅ Lesson created successfully:', result)

      return NextResponse.json({
        message: 'تم إضافة الحصة بنجاح',
        lesson: {
          id: lessonId,
          day: day_of_week,
          time: start_time,
          subject,
          duration: duration_minutes,
          room: room || null
        }
      })

    } catch (error) {
      console.error('❌ Error creating lesson:', error)
      return NextResponse.json({ 
        error: 'فشل في إضافة الحصة',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in lessons POST:', error)
    return NextResponse.json(
      { error: 'فشل في إضافة الحصة' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, day_of_week, start_time, subject, duration_minutes, room, group_id } = body

    if (!id || !day_of_week || !start_time || !subject || !duration_minutes) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // Validate day of week
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    if (!validDays.includes(day_of_week)) {
      return NextResponse.json({ error: 'يوم غير صحيح' }, { status: 400 })
    }

    // Check if lesson exists and belongs to this teacher
    const [existingLesson] = await executeQuery('SELECT * FROM lessons WHERE id = ? AND teacher_id = ?', [id, teacherRecordId])
    if (!existingLesson) {
      return NextResponse.json({ error: 'الحصة غير موجودة أو لا تملك صلاحية تعديلها' }, { status: 404 })
    }

    // Check for time conflicts (excluding current lesson)
    const conflictQuery = `
      SELECT id FROM lessons 
      WHERE teacher_id = ? AND day_of_week = ? AND start_time = ? AND id != ?
    `
    const conflicts = await executeQuery(conflictQuery, [teacherRecordId, day_of_week, start_time, id])
    
    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'يوجد تعارض في الوقت مع حصة أخرى' }, { status: 400 })
    }

    // Update the lesson
    const result = await executeQuery(`
      UPDATE lessons 
      SET day_of_week = ?, start_time = ?, subject = ?, duration_minutes = ?, room = ?, group_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND teacher_id = ?
    `, [
      day_of_week,
      start_time,
      subject,
      duration_minutes,
      room || null,
      group_id || null,
      id,
      teacherRecordId
    ])

    return NextResponse.json({
      message: 'تم تحديث الحصة بنجاح',
      lesson: {
        id,
        day: day_of_week,
        time: start_time,
        subject,
        duration: duration_minutes,
        room: room || null
      }
    })

  } catch (error) {
    console.error('❌ Error updating lesson:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الحصة' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('id')

    if (!lessonId) {
      return NextResponse.json({ error: 'معرف الحصة مطلوب' }, { status: 400 })
    }

    // Check if lesson exists and belongs to this teacher
    const [existingLesson] = await executeQuery('SELECT * FROM lessons WHERE id = ? AND teacher_id = ?', [lessonId, teacherRecordId])
    if (!existingLesson) {
      return NextResponse.json({ error: 'الحصة غير موجودة أو لا تملك صلاحية حذفها' }, { status: 404 })
    }

    // Delete the lesson
    await executeQuery('DELETE FROM lessons WHERE id = ? AND teacher_id = ?', [lessonId, teacherRecordId])

    return NextResponse.json({
      message: 'تم حذف الحصة بنجاح'
    })

  } catch (error) {
    console.error('❌ Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'فشل في حذف الحصة' },
      { status: 500 }
    )
  }
}
