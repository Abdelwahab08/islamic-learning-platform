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
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [teacherId])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    // Get total students
    const totalStudentsQuery = `
      SELECT COUNT(DISTINCT s.id) as total_students
      FROM students s
      JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id = ?
    `
    const totalStudentsResult = await executeQuery(totalStudentsQuery, [teacherRecordId])
    const totalStudents = totalStudentsResult[0]?.total_students || 0

    // Get active students (students with recent activity)
    const activeStudentsQuery = `
      SELECT COUNT(DISTINCT s.id) as active_students
      FROM students s
      JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id = ? AND s.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `
    const activeStudentsResult = await executeQuery(activeStudentsQuery, [teacherRecordId])
    const activeStudents = activeStudentsResult[0]?.active_students || 0

    // Get total assignments
    const totalAssignmentsQuery = `
      SELECT COUNT(DISTINCT a.id) as total_assignments
      FROM assignments a
      WHERE a.teacher_id = ?
    `
    const totalAssignmentsResult = await executeQuery(totalAssignmentsQuery, [teacherRecordId])
    const totalAssignments = totalAssignmentsResult[0]?.total_assignments || 0

    // Get pending submissions
    const pendingSubmissionsQuery = `
      SELECT COUNT(DISTINCT sub.id) as pending_submissions
      FROM submissions sub
      JOIN assignments a ON sub.assignment_id = a.id
      WHERE a.teacher_id = ? AND sub.grade IS NULL
    `
    const pendingSubmissionsResult = await executeQuery(pendingSubmissionsQuery, [teacherRecordId])
    const pendingSubmissions = pendingSubmissionsResult[0]?.pending_submissions || 0

    // Get certificates issued
    const certificatesQuery = `
      SELECT COUNT(DISTINCT c.id) as certificates_issued
      FROM certificates c
      WHERE c.teacher_id = ? AND c.status = 'APPROVED'
    `
    const certificatesResult = await executeQuery(certificatesQuery, [teacherRecordId])
    const certificatesIssued = certificatesResult[0]?.certificates_issued || 0

    // Get upcoming meetings
    const upcomingMeetingsQuery = `
      SELECT COUNT(DISTINCT m.id) as upcoming_meetings
      FROM meetings m
      WHERE m.teacher_id = ? AND m.scheduled_at >= NOW()
    `
    const upcomingMeetingsResult = await executeQuery(upcomingMeetingsQuery, [teacherRecordId])
    const upcomingMeetings = upcomingMeetingsResult[0]?.upcoming_meetings || 0

    // Get total groups
    const totalGroupsQuery = `
      SELECT COUNT(DISTINCT g.id) as total_groups
      FROM groups g
      WHERE g.teacher_id = ?
    `
    const totalGroupsResult = await executeQuery(totalGroupsQuery, [teacherRecordId])
    const totalGroups = totalGroupsResult[0]?.total_groups || 0

    return NextResponse.json({
      totalStudents,
      activeStudents,
      totalAssignments,
      pendingSubmissions,
      certificatesIssued,
      upcomingMeetings,
      totalGroups
    })

  } catch (error) {
    console.error('Error fetching teacher stats:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الإحصائيات' },
      { status: 500 }
    )
  }
}
