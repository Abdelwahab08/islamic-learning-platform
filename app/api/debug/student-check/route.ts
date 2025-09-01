import { NextResponse } from 'next/server'
import { executeQuery } from '@/config/database'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Check if student exists
    const student = await executeQuery(
      'SELECT * FROM students WHERE user_id = ?',
      [user.id]
    )

    // Check if user exists
    const userRecord = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [user.id]
    )

    // Check table structure
    const studentsStructure = await executeQuery('DESCRIBE students')
    const assignmentsStructure = await executeQuery('DESCRIBE assignments')
    const assignmentTargetsStructure = await executeQuery('DESCRIBE assignment_targets')
    const certificatesStructure = await executeQuery('DESCRIBE certificates')
    const meetingsStructure = await executeQuery('DESCRIBE meetings')
    const submissionsStructure = await executeQuery('DESCRIBE submissions')

    // Check if tables have any data
    const studentsCount = await executeQuery('SELECT COUNT(*) as count FROM students')
    const assignmentsCount = await executeQuery('SELECT COUNT(*) as count FROM assignments')
    const assignmentTargetsCount = await executeQuery('SELECT COUNT(*) as count FROM assignment_targets')
    const certificatesCount = await executeQuery('SELECT COUNT(*) as count FROM certificates')
    const meetingsCount = await executeQuery('SELECT COUNT(*) as count FROM meetings')
    const submissionsCount = await executeQuery('SELECT COUNT(*) as count FROM submissions')

    return NextResponse.json({
      user: {
        id: user.id,
        role: user.role,
        exists: userRecord.length > 0,
        userRecord: userRecord[0] || null
      },
      student: {
        exists: student.length > 0,
        record: student[0] || null
      },
      tableStructure: {
        students: studentsStructure,
        assignments: assignmentsStructure,
        assignment_targets: assignmentTargetsStructure,
        certificates: certificatesStructure,
        meetings: meetingsStructure,
        submissions: submissionsStructure
      },
      tableCounts: {
        students: studentsCount[0]?.count || 0,
        assignments: assignmentsCount[0]?.count || 0,
        assignment_targets: assignmentTargetsCount[0]?.count || 0,
        certificates: certificatesCount[0]?.count || 0,
        meetings: meetingsCount[0]?.count || 0,
        submissions: submissionsCount[0]?.count || 0
      }
    })
  } catch (error: any) {
    console.error('Error checking student data:', error)
    return NextResponse.json(
      { 
        message: 'حدث خطأ في الخادم', 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
