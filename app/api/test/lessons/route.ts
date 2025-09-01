import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing lessons data...')

    // Check if lessons table exists
    const [tables] = await executeQuery('SHOW TABLES LIKE "lessons"')
    console.log('Lessons table exists:', tables.length > 0)

    if (tables.length === 0) {
      return NextResponse.json({
        error: 'Lessons table does not exist',
        tables: tables
      })
    }

    // Get all lessons without any filters
    const allLessons = await executeQuery('SELECT * FROM lessons ORDER BY created_at DESC')
    console.log('All lessons in database:', allLessons)

    // Get lessons with teacher info
    const lessonsWithTeacher = await executeQuery(`
      SELECT 
        l.*,
        t.user_id,
        u.email
      FROM lessons l
      LEFT JOIN teachers t ON l.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY l.created_at DESC
    `)
    console.log('Lessons with teacher info:', lessonsWithTeacher)

    return NextResponse.json({
      success: true,
      totalLessons: allLessons.length,
      allLessons: allLessons,
      lessonsWithTeacher: lessonsWithTeacher
    })

  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json({
      error: 'Database error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
