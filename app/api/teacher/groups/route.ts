import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

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

    try {
      // Try new schema first
      const groups = await executeQuery(`
        SELECT 
          g.id,
          g.name,
          g.description,
          g.max_students,
          g.level_stage_id,
          st.name_ar as stage_name,
          COUNT(gm.student_id) as current_students,
          u.email as teacher_name,
          g.created_at
        FROM groups g
        JOIN teachers t ON g.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON g.level_stage_id = st.id
        LEFT JOIN group_students gm ON g.id = gm.group_id
        WHERE t.user_id = ?
        GROUP BY g.id
        ORDER BY g.created_at DESC
      `, [user.id])

      const transformedGroups = groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        max_students: group.max_students || 20,
        stage_name: group.stage_name || 'غير محدد',
        current_students: group.current_students || 0,
        teacher_name: group.teacher_name || '',
        created_at: group.created_at || new Date().toISOString()
      }))

      return NextResponse.json({ groups: transformedGroups })

    } catch (error) {
      console.log('❌ New schema query failed, trying old schema...')
      
      // Fallback to old schema
      const groups = await executeQuery(`
        SELECT 
          g.id,
          g.name,
          g.level_stage_id,
          st.name_ar as stage_name,
          COUNT(gm.student_id) as current_students
        FROM groups g
        JOIN teachers t ON g.teacher_id = t.id
        LEFT JOIN stages st ON g.level_stage_id = st.id
        LEFT JOIN group_students gm ON g.id = gm.group_id
        WHERE t.user_id = ?
        GROUP BY g.id
        ORDER BY g.id DESC
      `, [user.id])

      const transformedGroups = groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: '',
        max_students: 20,
        stage_name: group.stage_name || 'غير محدد',
        current_students: group.current_students || 0,
        teacher_name: user.email,
        created_at: new Date().toISOString()
      }))

      return NextResponse.json({ groups: transformedGroups })
    }

  } catch (error) {
    console.error('❌ Error fetching groups:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل المجموعات' },
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

    const { name, description, max_students, level_stage_id } = await request.json()

    if (!name || !max_students || !level_stage_id) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    if (max_students < 1 || max_students > 50) {
      return NextResponse.json({ error: 'عدد الطلاب يجب أن يكون بين 1 و 50' }, { status: 400 })
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

    // Check for duplicate group name for this teacher
    const existingGroup = await executeQuery(
      'SELECT id FROM groups WHERE name = ? AND teacher_id = ?',
      [name, teacherId]
    )

    if (existingGroup.length > 0) {
      return NextResponse.json({ error: 'يوجد مجموعة بنفس الاسم' }, { status: 400 })
    }

    const groupId = uuidv4()

    try {
      // Try new schema first
      await executeUpdate(`
        INSERT INTO groups (id, name, description, max_students, teacher_id, level_stage_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [groupId, name, description || '', max_students, teacherId, level_stage_id])

    } catch (error) {
      console.log('❌ New schema insert failed, trying old schema...')
      
      // Fallback to old schema
      await executeUpdate(`
        INSERT INTO groups (id, name, teacher_id, level_stage_id)
        VALUES (?, ?, ?, ?)
      `, [groupId, name, teacherId, level_stage_id])
    }

    return NextResponse.json({
      message: 'تم إنشاء المجموعة بنجاح',
      group: {
        id: groupId,
        name,
        description: description || '',
        maxStudents: max_students,
        stageId: level_stage_id
      }
    })

  } catch (error) {
    console.error('❌ Error creating group:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء المجموعة' },
      { status: 500 }
    )
  }
}
