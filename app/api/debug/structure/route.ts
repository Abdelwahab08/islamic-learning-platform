import { NextResponse } from 'next/server'
import { executeQuery } from '@/config/database'

export async function GET() {
  try {
    // Check students table structure
    const studentsStructure = await executeQuery('DESCRIBE students')
    
    // Check assignments table structure
    const assignmentsStructure = await executeQuery('DESCRIBE assignments')
    
    // Check assignment_targets table structure
    const assignmentTargetsStructure = await executeQuery('DESCRIBE assignment_targets')
    
    // Check certificates table structure
    const certificatesStructure = await executeQuery('DESCRIBE certificates')
    
    // Check meetings table structure
    const meetingsStructure = await executeQuery('DESCRIBE meetings')
    
    // Check submissions table structure
    const submissionsStructure = await executeQuery('DESCRIBE submissions')
    
    // Check materials table structure
    const materialsStructure = await executeQuery('DESCRIBE materials')
    
    return NextResponse.json({
      students: studentsStructure,
      assignments: assignmentsStructure,
      assignment_targets: assignmentTargetsStructure,
      certificates: certificatesStructure,
      meetings: meetingsStructure,
      submissions: submissionsStructure,
      materials: materialsStructure
    })
  } catch (error) {
    console.error('Error checking table structure:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم', error: error.message },
      { status: 500 }
    )
  }
}
