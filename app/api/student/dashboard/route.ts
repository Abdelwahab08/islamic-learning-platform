import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/config/database'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get student record ID
    const student = await executeQuery(
      'SELECT id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (student.length === 0) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات الطالب' },
        { status: 404 }
      )
    }

    const studentId = student[0].id

    // Get dashboard statistics
    const stats = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM assignments a 
         JOIN assignment_targets at ON at.assignment_id = a.id 
         WHERE at.student_id = ?) as totalAssignments,
        
        (SELECT COUNT(*) FROM assignments a 
         JOIN assignment_targets at ON at.assignment_id = a.id 
         LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = at.student_id
         WHERE at.student_id = ? AND s.id IS NULL) as pendingAssignments,
        
        (SELECT COUNT(*) FROM certificates WHERE student_id = ?) as totalCertificates,
        
        (SELECT COUNT(*) FROM meetings WHERE student_id = ? AND scheduled_at > NOW()) as upcomingMeetings,
        
        (SELECT COUNT(*) FROM materials) as totalMaterials
    `, [studentId, studentId, studentId, studentId])

    // Get recent activities
    const recentActivities = await executeQuery(`
      SELECT 
        'ASSIGNMENT' as type,
        a.title as title,
        a.created_at as date,
        'تم إضافة واجب جديد' as description
      FROM assignments a
      JOIN assignment_targets at ON at.assignment_id = a.id
      WHERE at.student_id = ?
      
      UNION ALL
      
      SELECT 
        'MEETING' as type,
        m.title as title,
        m.scheduled_at as date,
        'تم جدولة اجتماع جديد' as description
      FROM meetings m
      WHERE m.student_id = ?
      
      UNION ALL
      
      SELECT 
        'CERTIFICATE' as type,
        c.title as title,
        c.issued_at as date,
        'تم إصدار شهادة جديدة' as description
      FROM certificates c
      WHERE c.student_id = ?
      
      ORDER BY date DESC
      LIMIT 5
    `, [studentId, studentId, studentId])

    // Get current stage info
    const stageInfo = await executeQuery(`
      SELECT 
        s.name_ar as stageName,
        st.current_page as currentPage,
        st.total_pages as totalPages
      FROM students st
      LEFT JOIN stages s ON st.current_stage_id = s.id
      WHERE st.id = ?
    `, [studentId])

    const dashboardData = {
      stats: {
        totalAssignments: stats[0]?.totalAssignments || 0,
        pendingAssignments: stats[0]?.pendingAssignments || 0,
        totalCertificates: stats[0]?.totalCertificates || 0,
        upcomingMeetings: stats[0]?.upcomingMeetings || 0,
        totalMaterials: stats[0]?.totalMaterials || 0
      },
      recentActivities: recentActivities || [],
      currentStage: {
        name: stageInfo[0]?.stageName || 'المرحلة الابتدائية',
        currentPage: stageInfo[0]?.currentPage || 1,
        totalPages: stageInfo[0]?.totalPages || 10
      }
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching student dashboard:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
