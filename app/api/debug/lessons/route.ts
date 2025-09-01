import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking lessons data...')

    // Check if lessons table exists
    const [tables] = await executeQuery('SHOW TABLES LIKE "lessons"')
    console.log('Lessons table exists:', tables.length > 0)

    if (tables.length === 0) {
      return NextResponse.json({
        error: 'Lessons table does not exist',
        tables: tables
      })
    }

    // Check lessons table structure
    const [columns] = await executeQuery('DESCRIBE lessons')
    console.log('Lessons table structure:', columns)

    // Check total lessons count
    const [countResult] = await executeQuery('SELECT COUNT(*) as count FROM lessons')
    const totalLessons = countResult.count
    console.log('Total lessons:', totalLessons)

    // Get all lessons
    const lessons = await executeQuery('SELECT * FROM lessons ORDER BY created_at DESC')
    console.log('All lessons:', lessons)

    // Check teachers table
    const [teachersCount] = await executeQuery('SELECT COUNT(*) as count FROM teachers')
    console.log('Total teachers:', teachersCount.count)

    // Get sample teachers
    const teachers = await executeQuery('SELECT id, user_id, name FROM teachers LIMIT 5')
    console.log('Sample teachers:', teachers)

    return NextResponse.json({
      success: true,
      lessonsTableExists: tables.length > 0,
      totalLessons: totalLessons,
      lessons: lessons,
      totalTeachers: teachersCount.count,
      sampleTeachers: teachers,
      tableStructure: columns
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      error: 'Database error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
