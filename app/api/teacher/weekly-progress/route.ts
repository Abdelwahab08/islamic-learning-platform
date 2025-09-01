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
        return NextResponse.json([])
      }
      teacherRecordId = teachers[0].id
    } catch (error) {
      console.log('Error getting teacher record:', error)
      return NextResponse.json([])
    }

    // Get weekly progress data for students
    let weeklyProgress = []
    try {
      const progressResult = await executeQuery(`
        SELECT 
          s.id as student_id,
          CONCAT(u.first_name, ' ', u.last_name) as student_name,
          u.email as student_email,
          st.name_ar as stage_name,
          s.current_page,
          st.total_pages,
          ROUND((s.current_page / st.total_pages) * 100, 1) as progress_percentage,
          COUNT(DISTINCT sub.id) as assignments_completed,
          COUNT(DISTINCT c.id) as certificates_earned
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN stages st ON s.stage_id = st.id
        LEFT JOIN teacher_students ts ON s.id = ts.student_id
        LEFT JOIN submissions sub ON s.id = sub.student_id
        LEFT JOIN certificates c ON s.id = c.student_id AND c.status = 'APPROVED'
        WHERE ts.teacher_id = ?
        GROUP BY s.id, u.first_name, u.last_name, u.email, st.name_ar, s.current_page, st.total_pages
        ORDER BY progress_percentage DESC
      `, [teacherRecordId])
      
      weeklyProgress = progressResult.map(student => ({
        studentId: student.student_id,
        studentName: student.student_name || 'طالب',
        studentEmail: student.student_email,
        stageName: student.stage_name || 'غير محدد',
        currentPage: student.current_page || 1,
        totalPages: student.total_pages || 1,
        progressPercentage: student.progress_percentage || 0,
        assignmentsCompleted: student.assignments_completed || 0,
        certificatesEarned: student.certificates_earned || 0
      }))
    } catch (error) {
      console.log('Error getting weekly progress:', error)
      // Return empty array if query fails
      weeklyProgress = []
    }

    return NextResponse.json(weeklyProgress)

  } catch (error) {
    console.error('Error fetching weekly progress:', error)
    return NextResponse.json([])
  }
}
