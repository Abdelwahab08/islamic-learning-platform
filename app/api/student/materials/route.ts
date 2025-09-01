import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/config/database'

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

    // Get materials for this student - returning exact structure frontend expects
    const materials = await executeQuery(`
      SELECT 
        m.id,
        m.title,
        m.file_path as fileUrl,
        m.created_at,
        u.email as teacherEmail,
        'المرحلة المتوسطة' as stageName
      FROM materials m
      LEFT JOIN users u ON m.teacher_id = u.id
      ORDER BY m.created_at DESC
    `)

    const transformedMaterials = materials.map((material: any) => ({
      id: material.id,
      title: material.title,
      fileUrl: material.fileUrl,
      fileType: material.fileUrl?.endsWith('.pdf') ? 'PDF' : 'FILE',
      createdAt: material.created_at,
      teacherEmail: material.teacherEmail || 'غير محدد',
      stageName: material.stageName
    }))

    return NextResponse.json({ materials: transformedMaterials })

  } catch (error) {
    console.error('Error fetching student materials:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
