import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Return static test data without any database queries
    return NextResponse.json({
      message: 'Student API is working!',
      user: {
        id: user.id,
        role: user.role
      },
      dashboard: {
        stats: {
          totalAssignments: 5,
          pendingAssignments: 2,
          totalCertificates: 3,
          upcomingMeetings: 1,
          totalMaterials: 10
        },
        recentActivities: [
          {
            type: 'ASSIGNMENT',
            title: 'واجب تجريبي',
            date: new Date().toISOString(),
            description: 'تم إضافة واجب جديد'
          }
        ],
        currentStage: {
          name: 'المرحلة الابتدائية',
          currentPage: 1,
          totalPages: 10
        }
      },
      assignments: [
        {
          id: 1,
          title: 'واجب تجريبي',
          description: 'وصف الواجب',
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          status: 'PENDING',
          teacherName: 'معلم تجريبي',
          teacherEmail: 'teacher@test.com'
        }
      ],
      certificates: [
        {
          id: 1,
          serialNumber: 1,
          grade: 'ممتاز',
          issueDate: new Date().toISOString(),
          status: 'ISSUED',
          createdAt: new Date().toISOString(),
          teacherEmail: 'teacher@test.com',
          stageName: 'المرحلة المتوسطة'
        }
      ],
      meetings: [
        {
          id: 1,
          title: 'اجتماع تجريبي',
          description: 'وصف الاجتماع',
          scheduled_at: new Date().toISOString(),
          duration_minutes: 60,
          status: 'SCHEDULED',
          teacher_name: 'معلم تجريبي',
          provider: 'ZOOM',
          join_url: null,
          stage_name: 'المرحلة المتوسطة'
        }
      ],
      materials: [
        {
          id: 1,
          title: 'مادة تجريبية',
          fileUrl: '/materials/test.pdf',
          fileType: 'PDF',
          createdAt: new Date().toISOString(),
          teacherEmail: 'teacher@test.com',
          stageName: 'المرحلة المتوسطة'
        }
      ],
      schedule: [
        {
          type: 'MEETING',
          id: 1,
          title: 'اجتماع تجريبي',
          description: 'وصف الاجتماع',
          date: new Date().toISOString().split('T')[0],
          time: '10:00:00',
          duration: 60,
          teacher_name: 'معلم تجريبي',
          status: 'UPCOMING',
          location: null,
          meeting_url: null
        }
      ]
    })
  } catch (error: any) {
    console.error('Error in debug API:', error)
    return NextResponse.json(
      { 
        message: 'حدث خطأ في الخادم', 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
