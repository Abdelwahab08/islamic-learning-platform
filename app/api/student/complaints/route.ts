import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

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

    // Get complaints for this student
    const complaints = await executeQuery(`
      SELECT 
        c.id,
        c.subject,
        c.body,
        c.status,
        c.created_at,
        c.updated_at
      FROM complaints c
      WHERE c.student_id = ?
      ORDER BY c.created_at DESC
    `, [studentId])

    const transformedComplaints = complaints.map((complaint: any) => ({
      id: complaint.id,
      subject: complaint.subject,
      body: complaint.body,
      status: complaint.status,
      createdAt: complaint.created_at,
      updatedAt: complaint.updated_at
    }))

    return NextResponse.json({ complaints: transformedComplaints })

  } catch (error) {
    console.error('Error fetching student complaints:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const { subject, body } = await request.json()

    if (!subject || !body) {
      return NextResponse.json(
        { message: 'الموضوع والمحتوى مطلوبان' },
        { status: 400 }
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

    // Create new complaint
    const complaintId = uuidv4()
    await executeUpdate(`
      INSERT INTO complaints (id, student_id, subject, body, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [complaintId, studentId, subject, body])

    return NextResponse.json({
      message: 'تم إرسال الشكوى بنجاح',
      complaintId
    })

  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
