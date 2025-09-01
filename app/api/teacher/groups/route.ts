import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id

    // Get teacher record
    let teacherRecordId = null
    try {
      const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
      if (teachers.length === 0) {
        return NextResponse.json([])
      }
      teacherRecordId = teachers[0].id
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json([])
    }

    // Get groups for this teacher
    let groups = []
    try {
      const groupsResult = await executeQuery(`
        SELECT 
          g.id,
          g.name,
          g.level_stage_id,
          st.name_ar as stage_name,
          COUNT(gm.student_id) as student_count
        FROM groups g
        LEFT JOIN stages st ON g.level_stage_id = st.id
        LEFT JOIN group_members gm ON g.id = gm.group_id
        WHERE g.teacher_id = ?
        GROUP BY g.id, g.name, g.level_stage_id, st.name_ar
        ORDER BY g.created_at DESC
      `, [teacherRecordId])
      
      groups = groupsResult.map(group => ({
        id: group.id,
        name: group.name,
        stageId: group.level_stage_id,
        stageName: group.stage_name || 'عام',
        studentCount: group.student_count || 0
      }))
    } catch (error) {
      console.log('Error getting groups:', error)
      // Return empty array if query fails
      groups = []
    }

    return NextResponse.json(groups)

  } catch (error) {
    console.error('Error fetching teacher groups:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { name, stageId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'اسم المجموعة مطلوب' }, { status: 400 })
    }

    const teacherId = user.id

    // Get teacher record
    let teacherRecordId = null
    try {
      const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
      if (teachers.length === 0) {
        return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
      }
      teacherRecordId = teachers[0].id
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json({ error: 'خطأ في قاعدة البيانات' }, { status: 500 })
    }

    // Create new group
    try {
      const groupId = crypto.randomUUID()
      await executeQuery(`
        INSERT INTO groups (id, teacher_id, name, level_stage_id) 
        VALUES (?, ?, ?, ?)
      `, [groupId, teacherRecordId, name, stageId || null])

      return NextResponse.json({ 
        message: 'تم إنشاء المجموعة بنجاح',
        groupId: groupId
      })
    } catch (error) {
      console.log('Error creating group:', error)
      return NextResponse.json({ error: 'فشل في إنشاء المجموعة' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
