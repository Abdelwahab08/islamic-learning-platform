import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuerySingle, executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get student info with assigned teacher
    const student = await executeQuerySingle(`
      SELECT 
        s.*, 
        st.name_ar as stage_name, 
        st.total_pages,
        t.id as teacher_id,
        u.email as teacher_name
      FROM students s 
      LEFT JOIN stages st ON s.current_stage_id = st.id 
      LEFT JOIN teacher_students ts ON s.id = ts.student_id
      LEFT JOIN teachers t ON ts.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE s.user_id = ?
    `, [user.id])

    if (!student) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات الطالب' },
        { status: 404 }
      )
    }

    // If student has an assigned teacher, filter content by teacher
    let teacherFilter = ''
    let teacherParams: any[] = []
    
    if (student.teacher_id) {
      teacherFilter = 'AND a.teacher_id = ?'
      teacherParams = [student.teacher_id]
    }

    // Get assignment stats (filtered by assigned teacher if any)
    const assignmentStats = await executeQuerySingle(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sub.id IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN sub.id IS NULL THEN 1 ELSE 0 END) as pending
      FROM assignments a
      LEFT JOIN submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
      WHERE (a.stage_id = ? OR EXISTS (
        SELECT 1 FROM assignment_targets at 
        JOIN group_members gm ON at.group_id = gm.group_id 
        WHERE at.assignment_id = a.id AND gm.student_id = ?
      )) ${teacherFilter}
    `, [student.id, student.current_stage_id, student.id, ...teacherParams])

    // Get certificate count (filtered by assigned teacher if any)
    let certificateQuery = 'SELECT COUNT(*) as count FROM certificates WHERE student_id = ? AND status = "APPROVED"'
    let certificateParams = [student.id]
    
    if (student.teacher_id) {
      certificateQuery += ' AND teacher_id = ?'
      certificateParams.push(student.teacher_id)
    }
    
    const certificateCount = await executeQuerySingle(certificateQuery, certificateParams)

    // Get upcoming meetings count (filtered by assigned teacher if any)
    let meetingsQuery = `
      SELECT COUNT(*) as count 
      FROM meetings m 
      WHERE (m.level_stage_id = ? OR EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = m.group_id AND gm.student_id = ?
      )) AND m.scheduled_at > NOW()
    `
    let meetingsParams = [student.current_stage_id, student.id]
    
    if (student.teacher_id) {
      meetingsQuery += ' AND m.teacher_id = ?'
      meetingsParams.push(student.teacher_id)
    }
    
    const upcomingMeetings = await executeQuerySingle(meetingsQuery, meetingsParams)

    return NextResponse.json({
      totalAssignments: assignmentStats?.total || 0,
      completedAssignments: assignmentStats?.completed || 0,
      pendingAssignments: assignmentStats?.pending || 0,
      certificates: certificateCount?.count || 0,
      currentStage: student.stage_name || 'غير محدد',
      currentPage: student.current_page || 0,
      totalPages: student.total_pages || 0,
      upcomingMeetings: upcomingMeetings?.count || 0,
      assignedTeacher: student.teacher_name ? {
        id: student.teacher_id,
        name: student.teacher_name
      } : null
    })

  } catch (error) {
    console.error('Student stats error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
