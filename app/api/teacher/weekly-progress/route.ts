import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

interface StudentProgress {
  studentId: string
  studentName: string
  studentEmail: string
  stageName: string
  currentPage: number
  totalPages: number
  progressPercentage: number
  assignmentsCompleted: number
  certificatesEarned: number
}

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
        console.log('No teacher record found for user:', teacherId)
        return NextResponse.json([])
      }
      teacherRecordId = teachers[0].id
      console.log('Found teacher record:', teacherRecordId)
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json([])
    }

    // Get weekly progress data for students - simplified query
    let weeklyProgress: StudentProgress[] = []
    try {
      // First, check if teacher has any students
      const hasStudents = await executeQuery(`
        SELECT COUNT(*) as count FROM teacher_students WHERE teacher_id = ?
      `, [teacherRecordId])
      
      if (hasStudents[0]?.count === 0) {
        console.log('No students assigned to teacher')
        return NextResponse.json([])
      }

      // Simplified query to avoid complex JOINs
      const progressResult = await executeQuery(`
        SELECT 
          s.id as student_id,
          COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'طالب') as student_name,
          u.email as student_email,
          COALESCE(st.name_ar, 'غير محدد') as stage_name,
          COALESCE(s.current_page, 1) as current_page,
          COALESCE(st.total_pages, 1) as total_pages
        FROM teacher_students ts
        JOIN students s ON ts.student_id = s.id
        JOIN users u ON s.user_id = u.id
        LEFT JOIN stages st ON s.stage_id = st.id
        WHERE ts.teacher_id = ?
        ORDER BY u.first_name, u.last_name
      `, [teacherRecordId])
      
      weeklyProgress = progressResult.map((student: any) => {
        const currentPage = student.current_page || 1
        const totalPages = student.total_pages || 1
        const progressPercentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0
        
        return {
          studentId: student.student_id,
          studentName: student.student_name || 'طالب',
          studentEmail: student.student_email,
          stageName: student.stage_name || 'غير محدد',
          currentPage: currentPage,
          totalPages: totalPages,
          progressPercentage: progressPercentage,
          assignmentsCompleted: 0, // Will implement later
          certificatesEarned: 0    // Will implement later
        }
      })
      
      console.log(`Found ${weeklyProgress.length} students for teacher`)
    } catch (error) {
      console.log('Error getting weekly progress:', error)
      // Return empty array if query fails
      weeklyProgress = []
    }

    // Return comprehensive data including meetings and materials
    const comprehensiveData = {
      weeklyProgress,
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

    return NextResponse.json(comprehensiveData)

  } catch (error) {
    console.error('Error fetching weekly progress:', error)
    return NextResponse.json([])
  }
}
