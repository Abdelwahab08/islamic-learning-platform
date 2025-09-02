import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

interface Group {
  id: string
  name: string
  description: string
  max_students: number
  current_students: number
  created_at: string
  teacher_name: string
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
        return NextResponse.json({ groups: [] })
      }
      teacherRecordId = teachers[0].id
      console.log('Found teacher record ID:', teacherRecordId)
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json({ groups: [] })
    }

    // Get groups for this teacher
    let groups: Group[] = []
    try {
      console.log('Querying groups for teacher ID:', teacherRecordId)
      
      const groupsResult = await executeQuery(`
        SELECT 
          g.id,
          g.name,
          COALESCE(g.description, '') as description,
          COALESCE(g.max_students, 20) as max_students,
          COALESCE(COUNT(gm.student_id), 0) as current_students,
          g.created_at,
          u.email as teacher_name
        FROM \`groups\` g
        LEFT JOIN \`group_members\` gm ON g.id = gm.group_id
        LEFT JOIN teachers t ON g.teacher_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE g.teacher_id = ?
        GROUP BY g.id, g.name, g.description, g.max_students, g.created_at, u.email
        ORDER BY g.created_at DESC
      `, [teacherRecordId])
      
      console.log(`Found ${groupsResult.length} groups for teacher ${teacherRecordId}`)
      
      groups = groupsResult.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        max_students: group.max_students || 20,
        current_students: group.current_students || 0,
        created_at: group.created_at || new Date().toISOString(),
        teacher_name: group.teacher_name || user.email
      }))
      
      console.log('Processed groups:', groups)
    } catch (error) {
      console.log('Error getting groups:', error)
      // Return empty array if query fails
      groups = []
    }

    console.log(`Returning ${groups.length} groups`)
    return NextResponse.json({ groups })

  } catch (error) {
    console.error('Error fetching teacher groups:', error)
    return NextResponse.json({ groups: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { name, description, max_students, level_stage_id } = await request.json()
    console.log('Creating group with data:', { name, description, max_students, level_stage_id })

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
        INSERT INTO \`groups\` (id, teacher_id, name, description, max_students, level_stage_id, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [groupId, teacherRecordId, name, description || '', max_students || 20, level_stage_id || null])

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
