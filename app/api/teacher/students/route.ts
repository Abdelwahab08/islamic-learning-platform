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

    // Get teacher record
    let teacherRecordId = null
    try {
      const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
      if (teachers.length === 0) {
        console.log('No teacher record found for user:', teacherId)
        return NextResponse.json({ students: [] })
      }
      teacherRecordId = teachers[0].id
      console.log('Found teacher record ID:', teacherRecordId)
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json({ students: [] })
    }

    // Get students assigned to this teacher
    let students: Student[] = []
    try {
      console.log('Querying students for teacher ID:', teacherRecordId)
      
      // Simplified query to avoid complex JOINs that might fail
      const studentsResult = await executeQuery(`
        SELECT 
          s.id,
          COALESCE(CONCAT(u.first_name, ' ', u.last_name), u.email) as name,
          u.email,
          COALESCE(u.phone, 'غير محدد') as phone,
          COALESCE(s.created_at, NOW()) as join_date,
          COALESCE(st.name_ar, 'غير محدد') as current_stage,
          COALESCE(ROUND((s.current_page / st.total_pages) * 100, 1), 0) as progress_percentage,
          0 as total_assignments,
          0 as completed_assignments,
          0 as certificates_count,
          COALESCE(s.updated_at, NOW()) as last_activity,
          'active' as status,
          COALESCE(g.name, 'غير محدد') as group_name,
          '' as teacher_notes
        FROM teacher_students ts
        JOIN students s ON ts.student_id = s.id
        JOIN users u ON s.user_id = u.id
        LEFT JOIN stages st ON s.stage_id = st.id
        LEFT JOIN group_members gm ON s.id = gm.student_id
        LEFT JOIN \`groups\` g ON gm.group_id = g.id
        WHERE ts.teacher_id = ?
        ORDER BY u.first_name, u.last_name
      `, [teacherRecordId])
      
      console.log(`Found ${studentsResult.length} students for teacher`)
      
      students = studentsResult.map((student: any) => ({
        id: student.id,
        name: student.name || 'طالب غير معروف',
        email: student.email || 'unknown@email.com',
        phone: student.phone || 'غير محدد',
        join_date: student.join_date || new Date().toISOString(),
        current_stage: student.current_stage || 'غير محدد',
        progress_percentage: student.progress_percentage || 0,
        total_assignments: student.total_assignments || 0,
        completed_assignments: student.completed_assignments || 0,
        certificates_count: student.certificates_count || 0,
        last_activity: student.last_activity || new Date().toISOString(),
        status: student.status || 'active',
        group_name: student.group_name || 'غير محدد',
        teacher_notes: student.teacher_notes || ''
      }))
      
      console.log('Processed students:', students)
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
