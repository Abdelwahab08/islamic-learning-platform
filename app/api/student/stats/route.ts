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

    // Get student's current stage and progress
    let currentStage = 'غير محدد';
    let currentPage = 0;
    let totalPages = 0;
    let pendingAssignments = 0;
    let hasStarted = false;

    try {
      const [stageResult] = await executeQuery(`
        SELECT 
          s.name_ar as stage_name,
          st.current_page,
          s.total_pages,
          st.current_stage_id
        FROM students st
        LEFT JOIN stages s ON st.current_stage_id = s.id
        WHERE st.user_id = ?
      `, [user.id]);
      
      if (stageResult && stageResult.current_stage_id) {
        // Student has been assigned to a stage
        hasStarted = true;
        currentStage = stageResult.stage_name || 'مرحلة جديدة';
        currentPage = stageResult.current_page || 1;
        totalPages = stageResult.total_pages || 1;
      } else {
        // Student hasn't started yet - assign them to the first stage
        hasStarted = false;
        currentStage = 'لم تبدأ بعد';
        currentPage = 0;
        totalPages = 0;
      }
    } catch (error: any) {
      console.log('Error getting stage info:', error?.message || error);
    }

    // If student hasn't started, offer to assign them to the first stage
    if (!hasStarted) {
      try {
        const [firstStage] = await executeQuery(
          'SELECT id, name_ar, total_pages FROM stages ORDER BY order_index LIMIT 1'
        );
        
        if (firstStage) {
          // Update the student to start with the first stage
          await executeQuery(
            'UPDATE students SET current_stage_id = ?, current_page = 1 WHERE user_id = ?',
            [firstStage.id, user.id]
          );
          
          // Update our local variables
          currentStage = firstStage.name_ar;
          currentPage = 1;
          totalPages = firstStage.total_pages;
          hasStarted = true;
        }
      } catch (error: any) {
        console.log('Error assigning student to first stage:', error?.message || error);
      }
    }

    try {
      const [pendingResult] = await executeQuery(`
        SELECT COUNT(*) as count 
        FROM assignment_targets 
        WHERE student_id = ? AND status = 'PENDING'
      `, [studentId]);
      
      pendingAssignments = pendingResult.count || 0;
    } catch (error: any) {
      console.log('Error getting pending assignments:', error?.message || error);
    }

    const stats = {
      totalCertificates: certificateCount.count,
      totalAssignments: assignmentCount.count,
      totalMeetings: meetingCount.count,
      totalMaterials: materialCount.count,
      completedAssignments: Math.floor(assignmentCount.count * 0.7), // Mock data
      upcomingMeetings: Math.min(meetingCount.count, 3), // Mock data
      averageGrade: 'ممتاز', // Mock data
      progressPercentage: 75, // Mock data
      // Add the missing progress data
      currentStage: currentStage,
      currentPage: currentPage,
      totalPages: totalPages,
      pendingAssignments: pendingAssignments
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
