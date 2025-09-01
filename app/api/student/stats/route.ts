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

    // Get student statistics with proper error handling
    let certificateCount = { count: 0 };
    let assignmentCount = { count: 0 };
    let meetingCount = { count: 0 };
    let materialCount = { count: 0 };

    try {
      const [certResult] = await executeQuery(
        'SELECT COUNT(*) as count FROM certificates WHERE student_id = ?',
        [studentId]
      );
      certificateCount = certResult;
    } catch (error: any) {
      console.log('Error getting certificate count:', error?.message || error);
    }

    try {
      const [assignResult] = await executeQuery(
        'SELECT COUNT(*) as count FROM assignment_targets WHERE student_id = ?',
        [studentId]
      );
      assignmentCount = assignResult;
    } catch (error: any) {
      console.log('Error getting assignment count:', error?.message || error);
    }

    try {
      // Since meetings table doesn't have student_id, get total meetings count
      const [meetResult] = await executeQuery(
        'SELECT COUNT(*) as count FROM meetings WHERE scheduled_at > NOW()',
        []
      );
      meetingCount = meetResult;
    } catch (error: any) {
      console.log('Error getting meeting count:', error?.message || error);
    }

    try {
      const [matResult] = await executeQuery(
        'SELECT COUNT(*) as count FROM materials',
        []
      );
      materialCount = matResult;
    } catch (error: any) {
      console.log('Error getting material count:', error?.message || error);
    }

    const stats = {
      totalCertificates: certificateCount.count,
      totalAssignments: assignmentCount.count,
      totalMeetings: meetingCount.count,
      totalMaterials: materialCount.count,
      completedAssignments: Math.floor(assignmentCount.count * 0.7), // Mock data
      upcomingMeetings: Math.min(meetingCount.count, 3), // Mock data
      averageGrade: 'ممتاز', // Mock data
      progressPercentage: 75 // Mock data
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
