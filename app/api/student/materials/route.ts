import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Get student record ID and current stage
    const student = await executeQuery(
      'SELECT id, current_stage_id FROM students WHERE user_id = ?',
      [user.id]
    )

    if (student.length === 0) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات الطالب' },
        { status: 404 }
      )
    }

    const studentId = student[0].id
    const currentStageId = student[0].current_stage_id

    // Get materials for this student's stage
    const materials = await executeQuery(`
      SELECT 
        m.id,
        m.title,
        m.file_url,
        m.kind,
        m.created_at,
        u.email as teacher_email,
        st.name_ar as stage_name
      FROM materials m
      LEFT JOIN teachers t ON m.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN stages st ON m.stage_id = st.id
      WHERE m.stage_id = ?
      ORDER BY m.created_at DESC
    `, [currentStageId])

    const transformedMaterials = materials.map((material: any) => ({
      id: material.id,
      title: material.title,
      fileUrl: material.file_url,
      fileType: material.kind,
      createdAt: material.created_at,
      teacherEmail: material.teacher_email,
      stageName: material.stage_name
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
