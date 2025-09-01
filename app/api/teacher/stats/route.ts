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
        // If no teacher record exists, create one or return default values
        console.log('No teacher record found, returning default values')
        return NextResponse.json({
          totalStudents: 0,
          activeStudents: 0,
          totalAssignments: 0,
          pendingSubmissions: 0,
          certificatesIssued: 0,
          upcomingMeetings: 0,
          totalGroups: 0
        })
      }
      teacherRecordId = teachers[0].id
    } catch (error) {
      console.log('Error getting teacher record:', error)
      // Return default values if teacher record query fails
      return NextResponse.json({
        totalStudents: 0,
        activeStudents: 0,
        totalAssignments: 0,
        pendingSubmissions: 0,
        certificatesIssued: 0,
        upcomingMeetings: 0,
        totalGroups: 0
      })
    }

    // Get total students - handle missing teacher_students table gracefully
    let totalStudents = 0
    try {
      const totalStudentsResult = await executeQuery(`
        SELECT COUNT(DISTINCT s.id) as total_students
        FROM students s
        JOIN teacher_students ts ON s.id = ts.student_id
        WHERE ts.teacher_id = ?
      `, [teacherRecordId])
      totalStudents = totalStudentsResult[0]?.total_students || 0
    } catch (error) {
      console.log('Error getting total students:', error)
      totalStudents = 0
    }

    // Get active students - handle missing updated_at column gracefully
    let activeStudents = 0
    try {
      const activeStudentsResult = await executeQuery(`
        SELECT COUNT(DISTINCT s.id) as active_students
        FROM students s
        JOIN teacher_students ts ON s.id = ts.student_id
        WHERE ts.teacher_id = ?
      `, [teacherRecordId])
      activeStudents = activeStudentsResult[0]?.active_students || 0
    } catch (error) {
      console.log('Error getting active students:', error)
      activeStudents = totalStudents // Default to total students if query fails
    }

    // Get total assignments - handle missing assignments table gracefully
    let totalAssignments = 0
    try {
      const totalAssignmentsResult = await executeQuery(`
        SELECT COUNT(DISTINCT a.id) as total_assignments
        FROM assignments a
        WHERE a.teacher_id = ?
      `, [teacherRecordId])
      totalAssignments = totalAssignmentsResult[0]?.total_assignments || 0
    } catch (error) {
      console.log('Error getting total assignments:', error)
      totalAssignments = 0
    }

    // Get pending submissions - handle missing submissions table gracefully
    let pendingSubmissions = 0
    try {
      const pendingSubmissionsResult = await executeQuery(`
        SELECT COUNT(DISTINCT sub.id) as pending_submissions
        FROM submissions sub
        JOIN assignments a ON sub.assignment_id = a.id
        WHERE a.teacher_id = ? AND sub.grade IS NULL
      `, [teacherRecordId])
      pendingSubmissions = pendingSubmissionsResult[0]?.pending_submissions || 0
    } catch (error) {
      console.log('Error getting pending submissions:', error)
      pendingSubmissions = 0
    }

    // Get certificates issued - handle missing certificates table gracefully
    let certificatesIssued = 0
    try {
      const certificatesResult = await executeQuery(`
        SELECT COUNT(DISTINCT c.id) as certificates_issued
        FROM certificates c
        WHERE c.teacher_id = ? AND c.status = 'APPROVED'
      `, [teacherRecordId])
      certificatesIssued = certificatesResult[0]?.certificates_issued || 0
    } catch (error) {
      console.log('Error getting certificates:', error)
      certificatesIssued = 0
    }

    // Get upcoming meetings - handle missing meetings table gracefully
    let upcomingMeetings = 0
    try {
      const upcomingMeetingsResult = await executeQuery(`
        SELECT COUNT(DISTINCT m.id) as upcoming_meetings
        FROM meetings m
        WHERE m.teacher_id = ? AND m.scheduled_at >= NOW()
      `, [teacherRecordId])
      upcomingMeetings = upcomingMeetingsResult[0]?.upcoming_meetings || 0
    } catch (error) {
      console.log('Error getting upcoming meetings:', error)
      upcomingMeetings = 0
    }

    // Get total groups - handle missing groups table gracefully
    let totalGroups = 0
    try {
      const totalGroupsResult = await executeQuery(`
        SELECT COUNT(DISTINCT g.id) as total_groups
        FROM \`groups\` g
        WHERE g.teacher_id = ?
      `, [teacherRecordId])
      totalGroups = totalGroupsResult[0]?.total_groups || 0
    } catch (error) {
      console.log('Error getting total groups:', error)
      totalGroups = 0
    }

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
    // Return default values instead of error
    return NextResponse.json({
      totalStudents: 0,
      activeStudents: 0,
      totalAssignments: 0,
      pendingSubmissions: 0,
      certificatesIssued: 0,
      upcomingMeetings: 0,
      totalGroups: 0
    })
  }
}
