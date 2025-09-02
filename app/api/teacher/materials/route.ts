import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    if (teachers.length === 0) {
      return NextResponse.json({ materials: [] })
    }
    const teacherRecordId = teachers[0].id

    // Get real materials from database
    const materials = await executeQuery(`
      SELECT 
        m.*,
        u.email as teacher_email,
        COALESCE(st.name_ar, 'عام') as stage_name
      FROM materials m
      JOIN teachers t ON m.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON m.level_stage_id = st.id
      WHERE m.teacher_id = ?
      ORDER BY m.created_at DESC
    `, [teacherRecordId])

    return NextResponse.json({ materials })

  } catch (error) {
    console.error('Error fetching teacher materials:', error)
    return NextResponse.json({ materials: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get teacher record ID
    const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
    if (teachers.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على المدرس' }, { status: 404 })
    }
    const teacherRecordId = teachers[0].id

    const body = await request.json()
    const { title, description, type, content, file_url, stage_id } = body

    if (!title) {
      return NextResponse.json({ error: 'عنوان المادة مطلوب' }, { status: 400 })
    }

    // Save to database
    const materialId = uuidv4()
    await executeQuery(`
      INSERT INTO materials (id, teacher_id, title, description, type, content, file_url, level_stage_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      materialId,
      teacherRecordId,
      title,
      description || '',
      type || 'document',
      content || '',
      file_url || '',
      stage_id || null
    ])

    // Get the created material
    const createdMaterial = await executeQuery(`
      SELECT 
        m.*,
        u.email as teacher_email,
        COALESCE(st.name_ar, 'عام') as stage_name
      FROM materials m
      JOIN teachers t ON m.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON m.level_stage_id = st.id
      WHERE m.id = ?
    `, [materialId])

    return NextResponse.json({
      message: 'تم إضافة المادة التعليمية بنجاح',
      material: createdMaterial[0]
    })

  } catch (error) {
    console.error('Error creating material:', error)
    return NextResponse.json(
      { error: 'فشل في إضافة المادة التعليمية' },
      { status: 500 }
    )
  }
}
