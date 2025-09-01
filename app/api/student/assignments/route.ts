import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى الواجبات' },
        { status: 403 }
      );
    }

    // Get assignments for the student
    const assignments = await executeQuery(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_at,
        a.created_at,
        u.email as teacher_name,
        CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as submitted,
        s.id as submission_id,
        s.file_url
      FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN teacher_students ts ON t.id = ts.teacher_id
      LEFT JOIN students st ON ts.student_id = st.id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND st.id = s.student_id
      WHERE st.user_id = ?
      ORDER BY a.created_at DESC
    `, [user.id]);

    return NextResponse.json({
      assignments: assignments.map(assignment => ({
        ...assignment,
        submitted: Boolean(assignment.submitted)
      }))
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل الواجبات' },
      { status: 500 }
    );
  }
}
