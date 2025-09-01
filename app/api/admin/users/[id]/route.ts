import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuerySingle } from '@/config/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى هذه البيانات' },
        { status: 403 }
      )
    }

    const userId = params.id

    // Get user details with role-specific information
    const userDetails = await executeQuerySingle(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.is_approved,
        u.onboarding_status,
        u.created_at,
        CASE 
          WHEN u.role = 'TEACHER' THEN t.id
          WHEN u.role = 'STUDENT' THEN s.id
          ELSE NULL
        END as profile_id,
        CASE 
          WHEN u.role = 'TEACHER' THEN t.verified
          WHEN u.role = 'STUDENT' THEN s.current_stage_id
          ELSE NULL
        END as additional_info
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE u.id = ?
    `, [userId])

    if (!userDetails) {
      return NextResponse.json(
        { message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Get additional role-specific data
    let additionalData = {}
    
    if (userDetails.role === 'TEACHER') {
      const teacherData = await executeQuerySingle(`
        SELECT 
          t.full_name,
          t.phone_number,
          t.bio,
          t.cv_file,
          COUNT(DISTINCT ts.student_id) as students_count,
          COUNT(c.id) as certificates_count
        FROM teachers t
        LEFT JOIN teacher_students ts ON t.id = ts.teacher_id
        LEFT JOIN certificates c ON t.id = c.teacher_id
        WHERE t.user_id = ?
        GROUP BY t.id, t.full_name, t.phone_number, t.bio, t.cv_file
      `, [userId])
      
      additionalData = {
        fullName: teacherData?.full_name || 'غير محدد',
        phoneNumber: teacherData?.phone_number || 'غير محدد',
        bio: teacherData?.bio || 'غير محدد',
        cvFile: teacherData?.cv_file || null,
        studentsCount: teacherData?.students_count || 0,
        certificatesCount: teacherData?.certificates_count || 0,
        verified: userDetails.additional_info
      }
    } else if (userDetails.role === 'STUDENT') {
      const studentData = await executeQuerySingle(`
        SELECT 
          s.current_stage_id,
          s.current_page,
          st.name_ar as stage_name,
          COUNT(c.id) as certificates_count,
          COUNT(sub.id) as submissions_count
        FROM students s
        LEFT JOIN stages st ON s.current_stage_id = st.id
        LEFT JOIN certificates c ON s.id = c.student_id
        LEFT JOIN submissions sub ON s.id = sub.student_id
        WHERE s.user_id = ?
        GROUP BY s.id
      `, [userId])
      
      // Get assigned teacher information
      const assignedTeacher = await executeQuerySingle(`
        SELECT 
          t.id as teacher_id,
          u.email as teacher_email
        FROM teacher_students ts
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE ts.student_id = ?
        LIMIT 1
      `, [userDetails.profile_id])
      
      additionalData = {
        currentStage: studentData?.stage_name || 'غير محدد',
        currentPage: studentData?.current_page || 0,
        certificatesCount: studentData?.certificates_count || 0,
        submissionsCount: studentData?.submissions_count || 0,
        assignedTeacher: assignedTeacher ? {
          id: assignedTeacher.teacher_id,
          name: assignedTeacher.teacher_email,
          email: assignedTeacher.teacher_email
        } : null
      }
    }

    const response = {
      id: userDetails.id,
      email: userDetails.email,
      role: userDetails.role,
      status: userDetails.is_approved ? 'APPROVED' : 
             userDetails.onboarding_status === 'REJECTED' ? 'REJECTED' : 'PENDING',
      created_at: userDetails.created_at,
      profile_id: userDetails.profile_id,
      ...additionalData
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل تفاصيل المستخدم' },
      { status: 500 }
    )
  }
}
