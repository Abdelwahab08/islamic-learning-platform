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
      console.log('Error getting teacher record:', error)
      return NextResponse.json(
        { message: 'خطأ في قاعدة البيانات' },
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
        INSERT INTO materials (id, teacher_id, stage_id, title, file_url, kind) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [materialId, teacherRecordId, stageId, title, JSON.stringify([fileUrl]), 'PDF'])

      return NextResponse.json({
        message: 'تم إضافة المادة التعليمية بنجاح',
        materialId: materialId
      })
    } catch (error) {
      console.log('Error creating material:', error)
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى المواد التعليمية' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');

    let query = '';
    let params: any[] = [];

    if (user.role === 'ADMIN') {
      // Admin can see all materials
      query = `
        SELECT 
          m.*,
          CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
          COALESCE(m.stage_id, 'عام') as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
      `;
    } else if (user.role === 'TEACHER') {
      // Teacher can see materials they created
      query = `
        SELECT 
          m.*,
          CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
          COALESCE(m.stage_id, 'عام') as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ?
      `;
      params.push(user.id);
    } else if (user.role === 'STUDENT') {
      // Student can see materials
      query = `
        SELECT 
          m.*,
          CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
          COALESCE(m.stage_id, 'عام') as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE 1=1
      `;
    }

    // Optional filter if caller passes a stage value via stageId param
    if (stageId) {
      query += ' AND m.stage_id = ?';
      params.push(stageId);
    }

    query += ' ORDER BY m.created_at DESC';

    let materials = [];
    try {
      materials = await executeQuery(query, params);
    } catch (error) {
      console.log('Error fetching materials:', error);
      // Return empty array if query fails
      materials = [];
    }

    return NextResponse.json(materials);

  } catch (error) {
    console.error('Error fetching materials:', error);
    // Return empty array instead of error
    return NextResponse.json([]);
  }
}
