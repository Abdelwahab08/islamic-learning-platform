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

    // Handle FormData instead of JSON
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const kind = formData.get('kind') as string
    const file = formData.get('file') as File
    const group_id = formData.get('group_id') as string
    const stage_id = formData.get('stage_id') as string

    if (!title) {
      return NextResponse.json({ error: 'عنوان المادة مطلوب' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 })
    }

    // For now, just save the file info to database
    // In a real app, you'd upload the file to storage and save the URL
    const materialId = uuidv4()
    const fileUrl = `/uploads/${file.name}` // Placeholder URL
    
    await executeQuery(`
      INSERT INTO materials (id, teacher_id, title, description, kind, file_url, level_stage_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      materialId,
      teacherRecordId,
      title,
      description || '',
      kind || 'PDF',
      fileUrl,
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
