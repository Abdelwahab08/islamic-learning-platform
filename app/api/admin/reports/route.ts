import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى هذه البيانات' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30'

    // Calculate date range
    const daysAgo = parseInt(range)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - daysAgo)

    // Get basic statistics
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      pendingApprovals,
      totalCertificates,
      pendingCertificates,
      totalAssignments,
      completedAssignments,
      totalMaterials,
      totalMeetings,
      totalComplaints,
      resolvedComplaints
    ] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM users'),
      executeQuery('SELECT COUNT(*) as count FROM teachers'),
      executeQuery('SELECT COUNT(*) as count FROM students'),
      executeQuery('SELECT COUNT(*) as count FROM users WHERE role = ?', ['TEACHER']),
      executeQuery('SELECT COUNT(*) as count FROM certificates'),
      executeQuery('SELECT COUNT(*) as count FROM certificates WHERE status = ?', ['PENDING']),
      executeQuery('SELECT COUNT(*) as count FROM assignments'),
      executeQuery('SELECT COUNT(*) as count FROM submissions'),
      executeQuery('SELECT COUNT(*) as count FROM materials'),
      executeQuery('SELECT COUNT(*) as count FROM meetings'),
      executeQuery('SELECT COUNT(*) as count FROM complaints'),
      executeQuery('SELECT COUNT(*) as count FROM complaints')
    ])

    // Get monthly statistics
    const monthlyStats = await executeQuery(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as newUsers,
        (SELECT COUNT(*) FROM certificates WHERE DATE_FORMAT(issued_at, '%Y-%m') = DATE_FORMAT(u.created_at, '%Y-%m')) as newCertificates,
        (SELECT COUNT(*) FROM assignments WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(u.created_at, '%Y-%m')) as newAssignments
      FROM users u
      WHERE created_at >= ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `, [dateFrom])

    // Get top teachers
    const topTeachers = await executeQuery(`
      SELECT 
        u.email as name,
        COUNT(DISTINCT ts.student_id) as students,
        COUNT(c.id) as certificates
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN teacher_students ts ON t.id = ts.teacher_id
      LEFT JOIN certificates c ON t.id = c.teacher_id
      GROUP BY t.id, u.email
      ORDER BY students DESC, certificates DESC
      LIMIT 5
    `)

    // Get stage progress
    const stageProgress = await executeQuery(`
      SELECT 
        st.name_ar as stage,
        COUNT(s.id) as students,
        ROUND((COUNT(s.id) / (SELECT COUNT(*) FROM students)) * 100, 1) as completionRate
      FROM stages st
      LEFT JOIN students s ON st.id = COALESCE(s.stage_id, s.current_stage_id)
      GROUP BY st.id, st.name_ar
      ORDER BY st.id
    `)

    const reportData = {
      totalUsers: totalUsers[0]?.count || 0,
      totalTeachers: totalTeachers[0]?.count || 0,
      totalStudents: totalStudents[0]?.count || 0,
      pendingApprovals: pendingApprovals[0]?.count || 0,
      totalCertificates: totalCertificates[0]?.count || 0,
      pendingCertificates: pendingCertificates[0]?.count || 0,
      totalAssignments: totalAssignments[0]?.count || 0,
      completedAssignments: completedAssignments[0]?.count || 0,
      totalMaterials: totalMaterials[0]?.count || 0,
      totalMeetings: totalMeetings[0]?.count || 0,
      totalComplaints: totalComplaints[0]?.count || 0,
      resolvedComplaints: resolvedComplaints[0]?.count || 0,
      monthlyStats: monthlyStats.map((stat: any) => ({
        month: stat.month,
        newUsers: stat.newUsers,
        newCertificates: stat.newCertificates,
        newAssignments: stat.newAssignments
      })),
      topTeachers: topTeachers.map((teacher: any) => ({
        name: teacher.name,
        students: teacher.students,
        certificates: teacher.certificates
      })),
      stageProgress: stageProgress.map((stage: any) => ({
        stage: stage.stage,
        students: stage.students,
        completionRate: stage.completionRate
      }))
    }

    return NextResponse.json(reportData)

  } catch (error: any) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل التقارير' },
      { status: 500 }
    )
  }
}
