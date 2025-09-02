import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teacherRecord = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    
    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    // Get all students that are not assigned to this teacher
    const unassignedStudents = await executeQuery(`
      SELECT s.id, s.user_id, u.first_name, u.last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id NOT IN (
        SELECT student_id 
        FROM teacher_students 
        WHERE teacher_id = ?
      )
      LIMIT 5
    `, [teacherId])

    if (unassignedStudents.length === 0) {
      return NextResponse.json({ 
        message: 'لا توجد طلاب غير مسجلين لهذا المعلم',
        assignedStudents: await executeQuery(`
          SELECT COUNT(*) as count 
          FROM teacher_students 
          WHERE teacher_id = ?
        `, [teacherId])
      })
    }

    // Assign these students to the teacher
    const assignments = []
    for (const student of unassignedStudents) {
      const assignmentId = uuidv4()
      await executeUpdate(`
        INSERT INTO teacher_students (teacher_id, student_id, assigned_at)
        VALUES (?, ?, NOW())
      `, [teacherId, student.id])
      
      assignments.push({
        student_id: student.id,
        student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim()
      })
    }

    return NextResponse.json({
      message: `تم تسجيل ${assignments.length} طلاب للمعلم`,
      assignments,
      teacherId
    })

  } catch (error) {
    console.error('Error setting up teacher students:', error)
    return NextResponse.json(
      { error: 'فشل في تسجيل الطلاب' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teacherRecord = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    
    if (teacherRecord.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على بيانات المعلم' }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id

    // Get assigned students
    const assignedStudents = await executeQuery(`
      SELECT 
        s.id, 
        s.user_id, 
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as name,
        ts.assigned_at
      FROM teacher_students ts
      JOIN students s ON ts.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ts.teacher_id = ?
      ORDER BY ts.assigned_at DESC
    `, [teacherId])

    return NextResponse.json({
      teacherId,
      assignedStudents,
      count: assignedStudents.length
    })

  } catch (error) {
    console.error('Error getting teacher students:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الطلاب' },
      { status: 500 }
    )
  }
}
