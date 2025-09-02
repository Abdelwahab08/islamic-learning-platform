import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json(
        { message: 'غير مصرح لك بإضافة المواد التعليمية' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const stageId = formData.get('stageId') as string
    const file = formData.get('file') as File

    if (!title || !stageId || !file) {
      return NextResponse.json(
        { message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Get teacher record
    let teacherRecordId = null
    try {
      const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id])
      if (teachers.length === 0) {
        return NextResponse.json(
          { message: 'لم يتم العثور على بيانات المعلم' },
          { status: 404 }
        )
      }
      teacherRecordId = teachers[0].id
    } catch (error) {
      console.error('Error getting teacher record:', error)
      return NextResponse.json(
        { message: 'خطأ في قاعدة البيانات' },
        { status: 500 }
      )
    }

    // Check if materials table exists
    try {
      await executeQuery('SELECT 1 FROM materials LIMIT 1')
    } catch (error) {
      console.error('Materials table does not exist or has issues:', error)
      return NextResponse.json(
        { message: 'جدول المواد التعليمية غير متاح حالياً' },
        { status: 500 }
      )
    }

    // Handle file upload (simplified for now)
    const fileName = file.name
    const fileUrl = `/uploads/materials/${fileName}`

    // Create material record
    try {
      const materialId = crypto.randomUUID()
      await executeQuery(`
        INSERT INTO materials (id, teacher_id, stage_id, title, file_url, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [materialId, teacherRecordId, stageId, title, fileUrl])

      return NextResponse.json({
        message: 'تم إضافة المادة التعليمية بنجاح',
        materialId
      })
    } catch (error) {
      console.error('Error creating material:', error)
      return NextResponse.json(
        { message: 'فشل في إضافة المادة التعليمية' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error adding material:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى المواد التعليمية' },
        { status: 403 }
      )
    }

    // Check if materials table exists
    try {
      await executeQuery('SELECT 1 FROM materials LIMIT 1')
    } catch (error) {
      console.error('Materials table does not exist or has issues:', error)
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const stageId = searchParams.get('stageId')
    const groupId = searchParams.get('groupId')

    let query = ''
    let params: any[] = []

    if (user.role === 'ADMIN') {
      // Admin can see all materials
      query = `
        SELECT 
          m.*,
          u.email as teacher_email,
          st.name_ar as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.stage_id = st.id
        WHERE 1=1
      `
    } else if (user.role === 'TEACHER') {
      // Teacher can see materials they created
      // Get teacher record first (same approach as weekly progress API)
      let teacherRecordId = null;
      try {
        const teachers = await executeQuery('SELECT id FROM teachers WHERE user_id = ?', [user.id]);
        if (teachers.length === 0) {
          console.log('No teacher record found for user:', user.id);
          return NextResponse.json([]);
        }
        teacherRecordId = teachers[0].id;
        console.log('Found teacher record ID:', teacherRecordId);
      } catch (error) {
        console.error('Error getting teacher record:', error);
        return NextResponse.json([]);
      }

      // Check if this teacher has any materials
      try {
        const hasMaterials = await executeQuery(
          'SELECT COUNT(*) as count FROM materials WHERE teacher_id = ?',
          [teacherRecordId]
        );
        
        if (hasMaterials[0]?.count === 0) {
          console.log('No materials found for teacher:', teacherRecordId);
          return NextResponse.json([]);
        }
      } catch (error) {
        console.error('Error checking materials count:', error);
        return NextResponse.json([]);
      }

      query = `
        SELECT 
          m.*,
          u.email as teacher_email,
          st.name_ar as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.stage_id = st.id
        WHERE m.teacher_id = ?
      `;
      params.push(teacherRecordId);
    } else if (user.role === 'STUDENT') {
      // Student can see materials for their stage or group
      query = `
        SELECT 
          m.*,
          u.email as teacher_email,
          st.name_ar as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.stage_id = st.id
        JOIN students s ON s.user_id = ?
        WHERE (m.stage_id = s.stage_id OR m.stage_id IN (
          SELECT gm.group_id FROM group_members gm WHERE gm.student_id = s.id
        ))
      `
      params.push(user.id)
    }

    if (stageId) {
      query += ' AND m.stage_id = ?'
      params.push(stageId)
    }

    if (groupId) {
      query += ' AND m.stage_id IN (SELECT stage_id FROM students WHERE id IN (SELECT student_id FROM group_members WHERE group_id = ?))'
      params.push(groupId)
    }

    query += ' ORDER BY m.created_at DESC'

    let materials = []
    try {
      materials = await executeQuery(query, params)
      console.log(`Found ${materials.length} materials`)
    } catch (error) {
      console.error('Error fetching materials:', error)
      // Return empty array if query fails
      materials = []
    }

    return NextResponse.json(materials)

  } catch (error) {
    console.error('Error fetching materials:', error)
    // Return empty array instead of error
    return NextResponse.json([])
  }
}
