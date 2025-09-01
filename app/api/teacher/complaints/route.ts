import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teacherRecord = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [user.id]
    )

    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    // Get complaints from assigned students
    const complaints = await executeQuery(`
      SELECT 
        c.id,
        c.subject,
        c.content,
        c.status,
        c.created_at,
        c.updated_at,
        u.email as student_email,
        s.current_stage_id,
        st.name_ar as stage_name
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stages st ON s.current_stage_id = st.id
      JOIN teacher_students ts ON s.id = ts.student_id
      WHERE ts.teacher_id = ?
      ORDER BY c.created_at DESC
    `, [teacherId])

    const transformedComplaints = complaints.map((complaint: any) => ({
      id: complaint.id,
      subject: complaint.subject,
      content: complaint.content,
      status: complaint.status,
      createdAt: complaint.created_at,
      updatedAt: complaint.updated_at,
      studentEmail: complaint.student_email,
      stageName: complaint.stage_name || 'غير محدد'
    }))

    return NextResponse.json({ complaints: transformedComplaints })

  } catch (error) {
    console.error('❌ Error fetching complaints:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الشكاوى' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { studentId, subject, content } = await request.json()

    if (!studentId || !subject || !content) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    // Get teacher record ID
    const teacherRecord = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [user.id]
    )

    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    // Verify student is assigned to this teacher
    const assignment = await executeQuery(
      'SELECT id FROM teacher_students WHERE teacher_id = ? AND student_id = ?',
      [teacherId, studentId]
    )

    if (assignment.length === 0) {
      return NextResponse.json({ error: 'الطالب غير مسند لهذا المعلم' }, { status: 403 })
    }

    // Create complaint
    const complaintId = uuidv4()
    await executeUpdate(`
      INSERT INTO complaints (id, student_id, subject, content, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [complaintId, studentId, subject, content])

    return NextResponse.json({
      message: 'تم إنشاء الشكوى بنجاح',
      complaintId
    })

  } catch (error) {
    console.error('❌ Error creating complaint:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الشكوى' },
      { status: 500 }
    )
  }
}
