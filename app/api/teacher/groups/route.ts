import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

interface Group {
  id: string
  name: string
  stageId: string | null
  stageName: string
  studentCount: number
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    console.log('Getting groups for teacher user ID:', teacherId)

    // Get teacher record
    let teacherRecordId = null
    try {
      const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
      if (teachers.length === 0) {
        console.log('No teacher record found for user:', teacherId)
        return NextResponse.json([])
      }
      teacherRecordId = teachers[0].id
      console.log('Found teacher record ID:', teacherRecordId)
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json([])
    }

    // Get groups for this teacher
    let groups: Group[] = []
    try {
      console.log('Querying groups for teacher ID:', teacherRecordId)
      
      // Debug: Check all groups and their teachers
      const allGroups = await executeQuery('SELECT g.*, t.user_id as teacher_user_id FROM `groups` g JOIN teachers t ON g.teacher_id = t.id')
      console.log(`Total groups in database: ${allGroups.length}`)
      allGroups.forEach(g => console.log(`  Group: ${g.name}, Teacher User ID: ${g.teacher_user_id}, Current User: ${teacherId}`))
      
      const groupsResult = await executeQuery(`
        SELECT 
          g.id,
          g.name,
          g.level_stage_id,
          COALESCE(st.name_ar, 'عام') as stage_name,
          COALESCE(COUNT(gm.student_id), 0) as student_count
        FROM \`groups\` g
        LEFT JOIN stages st ON g.level_stage_id = st.id
        LEFT JOIN \`group_members\` gm ON g.id = gm.group_id
        WHERE g.teacher_id = ?
        GROUP BY g.id, g.name, g.level_stage_id, st.name_ar
        ORDER BY g.created_at DESC
      `, [teacherRecordId])
      
      console.log(`Found ${groupsResult.length} groups for teacher ${teacherRecordId}`)
      
      groups = groupsResult.map((group: any) => ({
        id: group.id,
        name: group.name,
        stageId: group.level_stage_id,
        stageName: group.stage_name || 'عام',
        studentCount: group.student_count || 0
      }))
      
      console.log('Processed groups:', groups)
    } catch (error) {
      console.log('Error getting groups:', error)
      // Return empty array if query fails
      groups = []
    }

    console.log(`Returning ${groups.length} groups`)
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
    console.log('Creating group with data:', { name, stageId })

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
      console.log('Found teacher record ID for group creation:', teacherRecordId)
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json({ error: 'خطأ في قاعدة البيانات' }, { status: 500 })
    }

    // Create new group
    try {
      const groupId = crypto.randomUUID()
      console.log('Creating group with ID:', groupId)
      
      await executeQuery(`
        INSERT INTO \`groups\` (id, teacher_id, name, level_stage_id, created_at) 
        VALUES (?, ?, ?, ?, NOW())
      `, [groupId, teacherRecordId, name, stageId || null])

      console.log('Group created successfully')

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
