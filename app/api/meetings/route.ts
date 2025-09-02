import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { executeUpdate, executeQuery } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json(
        { message: 'غير مصرح لك بإنشاء الاجتماعات' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      scheduled_date,
      scheduled_time,
      duration,
      meeting_type,
      max_participants,
      meeting_link,
      location,
      target_type,
      target_id
    } = await request.json();

    if (!title || !scheduled_date || !scheduled_time || !target_id) {
      return NextResponse.json(
        { message: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }

    // Get teacher ID
    let teacherId = null;
    try {
      const teacher = await executeQuery(
        'SELECT id FROM teachers WHERE user_id = ?',
        [user.id]
      );

      if (!teacher.length) {
        return NextResponse.json(
          { message: 'لم يتم العثور على بيانات المعلم' },
          { status: 404 }
        );
      }
      teacherId = teacher[0].id;
    } catch (error) {
      console.error('Error getting teacher record:', error);
      return NextResponse.json(
        { message: 'خطأ في قاعدة البيانات' },
        { status: 500 }
      );
    }

    // Check if meetings table exists and has required columns
    try {
      await executeQuery('SELECT 1 FROM meetings LIMIT 1');
    } catch (error) {
      console.error('Meetings table does not exist or has issues:', error);
      return NextResponse.json(
        { message: 'جدول الاجتماعات غير متاح حالياً' },
        { status: 500 }
      );
    }

    // Create meeting
    try {
      const meetingId = uuidv4();
      await executeUpdate(`
        INSERT INTO meetings (
          id, teacher_id, title, scheduled_at, duration_minutes,
          provider, level_stage_id, group_id, join_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
      `, [
        meetingId,
        teacherId,
        title,
        `${scheduled_date} ${scheduled_time}`,
        duration,
        meeting_type || 'ZOOM',
        target_type === 'STAGE' ? target_id : null,
        target_type === 'GROUP' ? target_id : null,
        meeting_link || null,
      ]);

      // Get the created meeting
      const createdMeeting = await executeQuery(`
        SELECT 
          m.*,
          u.email as teacher_name
        FROM meetings m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE m.id = ?
      `, [meetingId]);

      return NextResponse.json({
        message: 'تم إنشاء الاجتماع بنجاح',
        meeting: createdMeeting[0]
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      return NextResponse.json(
        { message: 'حدث خطأ في إنشاء الاجتماع' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في إنشاء الاجتماع' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى الاجتماعات' },
        { status: 403 }
      );
    }

    // Check if meetings table exists
    try {
      await executeQuery('SELECT 1 FROM meetings LIMIT 1');
    } catch (error) {
      console.error('Meetings table does not exist or has issues:', error);
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = '';
    let params: any[] = [];

    if (user.role === 'ADMIN') {
      // Admin can see all meetings
      query = `
        SELECT 
          m.*,
          u.email as teacher_name,
          st.name_ar as stage_name
        FROM meetings m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.level_stage_id = st.id
        WHERE 1=1
      `;
    } else if (user.role === 'TEACHER') {
      // Teacher can see meetings they created
      // Get teacher record first (same approach as weekly progress API)
      let teacherRecordId = null;
      try {
        const teachers = await executeQuery(
          'SELECT id FROM teachers WHERE user_id = ?',
          [user.id]
        );
        if (teachers.length === 0) {
          console.log('No teacher record found for user:', user.id);
          return NextResponse.json([]);
        }
        teacherRecordId = teachers[0].id;
        console.log('Found teacher record ID:', teacherRecordId);
      } catch (error) {
        console.error('Error getting teacher record:', error);
        return NextResponse.json([]);
      }

      // Check if this teacher has any meetings
      try {
        const hasMeetings = await executeQuery(
          'SELECT COUNT(*) as count FROM meetings WHERE teacher_id = ?',
          [teacherRecordId]
        );
        
        if (hasMeetings[0]?.count === 0) {
          console.log('No meetings found for teacher:', teacherRecordId);
          return NextResponse.json([]);
        }
      } catch (error) {
        console.error('Error checking meetings count:', error);
        return NextResponse.json([]);
      }

      query = `
        SELECT 
          m.*,
          u.email as teacher_name,
          st.name_ar as stage_name
        FROM meetings m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.level_stage_id = st.id
        WHERE m.teacher_id = ?
      `;
      params.push(teacherRecordId);
    } else if (user.role === 'STUDENT') {
      // Student can see meetings they're invited to
      query = `
        SELECT 
          m.*,
          u.email as teacher_name,
          st.name_ar as stage_name
        FROM meetings m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.level_stage_id = st.id
        JOIN students s ON s.user_id = ?
        WHERE (m.level_stage_id = s.stage_id OR m.group_id IN (
          SELECT gm.group_id FROM group_members gm WHERE gm.student_id = s.id
        ))
      `;
      params.push(user.id);
    }

    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }

    query += ' ORDER BY m.scheduled_at DESC';

    let meetings = [];
    try {
      meetings = await executeQuery(query, params);
      console.log(`Found ${meetings.length} meetings for user ${user.id}`);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Return empty array if query fails
      meetings = [];
    }

    return NextResponse.json(meetings);

  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { message: 'فشل في تحميل الاجتماعات' },
      { status: 500 }
    );
  }
}
