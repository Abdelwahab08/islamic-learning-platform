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

    // Get student statistics
    const [certificateCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM certificates WHERE student_id = ?',
      [studentId]
    )

    const [assignmentCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM assignments WHERE student_id = ?',
      [studentId]
    )

    const [meetingCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM meetings WHERE student_id = ?',
      [studentId]
    )

    const [materialCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM materials',
      []
    )

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
