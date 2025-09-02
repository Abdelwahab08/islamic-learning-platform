import { NextResponse } from 'next/server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔗 Setting up teacher-student relationships...')

    // Get teacher@test.com record
    const teacherUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?', 
      ['teacher@test.com']
    )

    if (teacherUser.length === 0) {
      return NextResponse.json({ 
        error: 'teacher@test.com not found',
        suggestion: 'Create teacher account first'
      }, { status: 404 })
    }

    const teacherUserId = teacherUser[0].id
    console.log('Found teacher user ID:', teacherUserId)

    // Get teacher record from teachers table
    const teacherRecord = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [teacherUserId]
    )

    if (teacherRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Teacher record not found for teacher@test.com',
        suggestion: 'Create teacher profile first'
      }, { status: 404 })
    }

    const teacherId = teacherRecord[0].id
    console.log('Found teacher record ID:', teacherId)

    // Get all student test accounts
    const studentUsers = await executeQuery(`
      SELECT u.id as user_id, u.email, s.id as student_id
      FROM users u
      JOIN students s ON u.user_id = s.user_id
      WHERE u.email LIKE '%@test.com' OR u.email LIKE '%student%'
      ORDER BY u.email
    `)

    console.log('Found student accounts:', studentUsers.length)

    if (studentUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No student test accounts found',
        suggestion: 'Create student accounts first'
      }, { status: 404 })
    }

    // Connect teacher to all student test accounts
    const connections = []
    for (const student of studentUsers) {
      try {
        // Check if relationship already exists
        const existing = await executeQuery(
          'SELECT 1 FROM teacher_students WHERE teacher_id = ? AND student_id = ?',
          [teacherId, student.student_id]
        )

        if (existing.length === 0) {
          // Create the relationship
          await executeUpdate(
            'INSERT INTO teacher_students (teacher_id, student_id, assigned_at) VALUES (?, ?, NOW())',
            [teacherId, student.student_id]
          )
          
          connections.push({
            student_email: student.email,
            student_id: student.student_id,
            status: 'connected'
          })
          console.log(`✅ Connected ${student.email} to teacher@test.com`)
        } else {
          connections.push({
            student_email: student.email,
            student_id: student.student_id,
            status: 'already_connected'
          })
          console.log(`ℹ️ ${student.email} already connected to teacher@test.com`)
        }
      } catch (error) {
        console.error(`❌ Failed to connect ${student.email}:`, error)
        connections.push({
          student_email: student.email,
          student_id: student.student_id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Verify connections
    const finalConnections = await executeQuery(`
      SELECT 
        u.email as student_email,
        s.id as student_id,
        ts.assigned_at
      FROM teacher_students ts
      JOIN students s ON ts.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ts.teacher_id = ?
      ORDER BY u.email
    `, [teacherId])

    return NextResponse.json({
      message: `Successfully set up teacher-student relationships`,
      teacher_email: 'teacher@test.com',
      teacher_id: teacherId,
      connections_made: connections.filter(c => c.status === 'connected').length,
      total_connections: finalConnections.length,
      connections,
      final_students: finalConnections
    })

  } catch (error) {
    console.error('Error setting up teacher-student relationships:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup relationships',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get teacher@test.com info
    const teacherInfo = await executeQuery(`
      SELECT 
        u.email,
        u.id as user_id,
        t.id as teacher_id
      FROM users u
      JOIN teachers t ON u.id = t.user_id
      WHERE u.email = 'teacher@test.com'
    `)

    if (teacherInfo.length === 0) {
      return NextResponse.json({ 
        error: 'teacher@test.com not found or no teacher record'
      }, { status: 404 })
    }

    const teacher = teacherInfo[0]

    // Get connected students
    const connectedStudents = await executeQuery(`
      SELECT 
        u.email as student_email,
        s.id as student_id,
        ts.assigned_at
      FROM teacher_students ts
      JOIN students s ON ts.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ts.teacher_id = ?
      ORDER BY u.email
    `, [teacher.teacher_id])

    // Get all available students
    const allStudents = await executeQuery(`
      SELECT 
        u.email,
        s.id as student_id,
        u.id as user_id
      FROM users u
      JOIN students s ON u.id = s.user_id
      ORDER BY u.email
    `)

    return NextResponse.json({
      teacher: {
        email: teacher.email,
        user_id: teacher.user_id,
        teacher_id: teacher.teacher_id
      },
      connected_students: connectedStudents,
      connected_count: connectedStudents.length,
      all_students: allStudents,
      total_students: allStudents.length
    })

  } catch (error) {
    console.error('Error getting teacher-student info:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get relationships',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
