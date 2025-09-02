import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record id
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    if (teachers.length === 0) {
      return NextResponse.json({ weeklyProgress: [], meetings: [], materials: [], students: [] })
    }
    const teacherRecordId = teachers[0].id

    // Students
    const students = await executeQuery(`
      SELECT DISTINCT
        s.id,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as name,
        u.email,
        COALESCE(u.phone, 'غير محدد') as phone,
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
      WHERE (
        ts.teacher_id = ?
        OR ts.teacher_id IN (SELECT id FROM teachers WHERE user_id = ?)
        OR ts.teacher_id = ?
      )
      ORDER BY s.created_at DESC
    `, [teacherRecordId, user.id, user.id])

    // Weekly progress (reuse students data shape)
    const weeklyProgress = students.map((s: any) => ({
      studentId: s.id,
      studentName: s.name,
      studentEmail: s.email,
      stageName: s.current_stage,
      currentPage: s.progress_percentage || 0,
      totalPages:  s.total_pages || 0,
      progressPercentage: s.progress_percentage || 0,
      assignmentsCompleted: 0,
      certificatesEarned: s.certificates_count || 0
    }))

    // Meetings (teacher-owned)
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
      LIMIT 10
    `, [teacherRecordId])

    // Materials (teacher-owned)
    const materials = await executeQuery(`
      SELECT 
        m.*,
        u.email as teacher_email,
        COALESCE(st.name_ar, 'عام') as stage_name
      FROM materials m
      JOIN teachers t ON m.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON m.stage_id = st.id
      WHERE m.teacher_id = ?
      ORDER BY m.created_at DESC
      LIMIT 10
    `, [teacherRecordId])

    return NextResponse.json({ weeklyProgress, meetings, materials, students })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({
      weeklyProgress: [],
      meetings: [],
      materials: [],
      students: []
    })
  }
}
