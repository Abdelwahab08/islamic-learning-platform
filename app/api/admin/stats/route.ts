import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuerySingle, executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get total users
    const totalUsers = await executeQuerySingle(
      'SELECT COUNT(*) as count FROM users'
    )

    // Get pending approvals
    const pendingApprovals = await executeQuerySingle(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = 0 OR onboarding_status = "PENDING_REVIEW"'
    )

    // Get teachers count
    const totalTeachers = await executeQuerySingle(
      'SELECT COUNT(*) as count FROM teachers'
    )

    // Get students count
    const totalStudents = await executeQuerySingle(
      'SELECT COUNT(*) as count FROM students'
    )

    // Get certificates stats
    const certificateStats = await executeQuerySingle(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending
      FROM certificates
    `)

    // Get active toasts count
    const activeToasts = await executeQuerySingle(
      'SELECT COUNT(*) as count FROM admin_toasts WHERE active = 1'
    )

    // Get complaints count
    const totalComplaints = await executeQuerySingle(
      'SELECT COUNT(*) as count FROM complaints'
    )

    return NextResponse.json({
      totalUsers: totalUsers?.count || 0,
      pendingApprovals: pendingApprovals?.count || 0,
      totalTeachers: totalTeachers?.count || 0,
      totalStudents: totalStudents?.count || 0,
      totalCertificates: certificateStats?.total || 0,
      pendingCertificates: certificateStats?.pending || 0,
      activeToasts: activeToasts?.count || 0,
      totalComplaints: totalComplaints?.count || 0,
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
