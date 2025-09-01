import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json(
        { message: 'غير مصرح لك بتصدير البيانات' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const stageId = searchParams.get('stage_id');
    const groupId = searchParams.get('group_id');

    if (!from || !to) {
      return NextResponse.json(
        { message: 'يجب تحديد تاريخ البداية والنهاية' },
        { status: 400 }
      );
    }

    // Get teacher ID
    const teacher = await executeQuery(`
      SELECT id FROM teachers WHERE user_id = ?
    `, [user.id]);

    if (!teacher || teacher.length === 0) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات المعلم' },
        { status: 404 }
      );
    }

    const teacherId = teacher[0].id;

    // Build the query for students
    let studentsQuery = `
      SELECT DISTINCT
        s.id,
        u.email,
        st.name_ar as current_stage_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN teacher_students ts ON s.id = ts.student_id
      LEFT JOIN stages st ON s.current_stage_id = st.id
      WHERE ts.teacher_id = ?
    `;

    const studentsParams = [teacherId];

    if (stageId) {
      studentsQuery += ' AND s.current_stage_id = ?';
      studentsParams.push(stageId);
    }

    if (groupId) {
      studentsQuery += ' AND s.id IN (SELECT student_id FROM group_members WHERE group_id = ?)';
      studentsParams.push(groupId);
    }

    studentsQuery += ' ORDER BY u.email';

    const students = await executeQuery(studentsQuery, studentsParams);

    // Get progress logs
    const logsQuery = `
      SELECT 
        u.email as student_email,
        DATE(CONVERT_TZ(pl.created_at, 'UTC', 'Africa/Cairo')) as log_date,
        pl.rating,
        pl.page_number,
        pl.notes
      FROM progress_logs pl
      JOIN students s ON pl.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE pl.teacher_id = ?
        AND DATE(CONVERT_TZ(pl.created_at, 'UTC', 'Africa/Cairo')) BETWEEN ? AND ?
      ORDER BY u.email, log_date
    `;

    const logs = await executeQuery(logsQuery, [teacherId, from, to]);

    // Generate CSV content
    const csvHeaders = ['اسم الطالب', 'التاريخ', 'التقييم', 'رقم الصفحة', 'ملاحظات'];
    const csvRows = [csvHeaders.join(',')];

    logs.forEach((log: any) => {
      const row = [
        log.student_email.split('@')[0],
        log.log_date,
        log.rating,
        log.page_number,
        log.notes || ''
      ].map(field => `"${field}"`).join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="timetable-${from}-${to}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting timetable:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في تصدير البيانات' },
      { status: 500 }
    );
  }
}
