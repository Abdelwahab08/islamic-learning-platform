import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

interface Student {
  id: string
  name: string
  email: string
  phone: string
  join_date: string
  current_stage: string
  progress_percentage: number
  total_assignments: number
  completed_assignments: number
  certificates_count: number
  last_activity: string
  status: 'active' | 'inactive' | 'suspended'
  group_name?: string
  teacher_notes?: string
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const teacherId = user.id
    console.log('Getting students for teacher user ID:', teacherId)

    // Get teacher record ID from teachers table
    const teacherRecord = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    
    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherDbId = teacherRecord[0].id
    console.log('Teacher DB ID:', teacherDbId)

    // Get students assigned to this teacher ONLY
    let students: Student[] = []
    try {
      console.log('Querying students for teacher DB ID:', teacherDbId)
      
      const result = await executeQuery(`
        SELECT DISTINCT
          s.id,
          CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as name,
          u.email,
          u.phone,
          s.created_at as join_date,
          COALESCE(st.name_ar, 'غير محدد') as current_stage,
          COALESCE(s.current_page, 0) as progress_percentage,
          (SELECT COUNT(*) FROM assignment_targets at WHERE at.student_id = s.id) as total_assignments,
          0 as completed_assignments,
          (SELECT COUNT(*) FROM certificates c WHERE c.student_id = s.id) as certificates_count,
          s.updated_at as last_activity,
          'active' as status,
          'غير محدد' as group_name,
          '' as teacher_notes
        FROM teacher_students ts
        JOIN students s ON ts.student_id = s.id
        JOIN users u ON s.user_id = u.id
        LEFT JOIN stages st ON s.current_stage_id = st.id
        WHERE ts.teacher_id = ?
        ORDER BY s.created_at DESC
      `, [teacherDbId])
      
      students = result
      console.log(`Found ${students.length} students assigned to teacher ${user.email}`)
      
    } catch (error) {
      console.log('Error getting students:', error)
      // Return empty array if query fails
      students = []
    }

    console.log(`Returning ${students.length} students`)
    return NextResponse.json({ students })

  } catch (error) {
    console.error('Error fetching teacher students:', error)
    return NextResponse.json({ students: [] })
  }
}
