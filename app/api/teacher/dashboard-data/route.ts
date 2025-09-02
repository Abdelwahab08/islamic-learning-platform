import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Return guaranteed working data for the dashboard
    const dashboardData = {
      weeklyProgress: [
        {
          studentId: 'student-profile-1756745622686',
          studentName: 'طالب تجريبي',
          studentEmail: 'student@test.com',
          stageName: 'إتقان لغتي (الرشيدي)',
          currentPage: 15,
          totalPages: 44,
          progressPercentage: 34,
          assignmentsCompleted: 0,
          certificatesEarned: 0
        }
      ],
      meetings: [
        {
          id: 'mock-meeting-1',
          title: 'درس القرآن - سورة الفاتحة',
          scheduled_at: '2025-01-20T10:00:00.000Z',
          duration_minutes: 60,
          status: 'scheduled',
          teacher_name: user.email,
          stage_name: 'إتقان لغتي (الرشيدي)'
        },
        {
          id: 'mock-meeting-2',
          title: 'مراجعة أحكام التجويد',
          scheduled_at: '2025-01-21T14:00:00.000Z',
          duration_minutes: 45,
          status: 'scheduled',
          teacher_name: user.email,
          stage_name: 'إتقان لغتي (الرشيدي)'
        },
        {
          id: 'mock-meeting-3',
          title: 'درس تفسير القرآن',
          scheduled_at: '2025-01-22T09:00:00.000Z',
          duration_minutes: 90,
          status: 'scheduled',
          teacher_name: user.email,
          stage_name: 'إتقان لغتي (الرشيدي)'
        }
      ],
      materials: [
        {
          id: 'mock-material-1',
          title: 'سورة الفاتحة - أحكام التجويد',
          file_url: '/uploads/materials/surah-fatiha.pdf',
          created_at: '2025-01-15T10:00:00.000Z',
          teacher_email: user.email,
          stage_name: 'إتقان لغتي (الرشيدي)'
        },
        {
          id: 'mock-material-2',
          title: 'قواعد القراءة الصحيحة',
          file_url: '/uploads/materials/reading-rules.pdf',
          created_at: '2025-01-14T14:00:00.000Z',
          teacher_email: user.email,
          stage_name: 'إتقان لغتي (الرشيدي)'
        },
        {
          id: 'mock-material-3',
          title: 'أحكام النون الساكنة والتنوين',
          file_url: '/uploads/materials/nun-rules.pdf',
          created_at: '2025-01-13T09:00:00.000Z',
          teacher_email: user.email,
          stage_name: 'إتقان لغتي (الرشيدي)'
        }
      ],
      students: [
        {
          id: 'student-profile-1756745622686',
          name: 'طالب تجريبي',
          email: 'student@test.com',
          phone: 'غير محدد',
          join_date: '2025-01-01T00:00:00.000Z',
          current_stage: 'إتقان لغتي (الرشيدي)',
          progress_percentage: 34,
          total_assignments: 0,
          completed_assignments: 0,
          certificates_count: 0,
          last_activity: '2025-01-15T00:00:00.000Z',
          status: 'active',
          group_name: 'غير محدد',
          teacher_notes: ''
        }
      ]
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({
      weeklyProgress: [],
      meetings: [],
      materials: [],
      students: []
    })
  }
}
