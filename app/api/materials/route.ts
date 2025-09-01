import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { executeUpdate, executeQuery } from '@/config/database';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json(
        { message: 'غير مصرح لك برفع المواد التعليمية' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const targetType = formData.get('targetType') as string;
    const targetId = formData.get('targetId') as string; // expected to be a level string in current schema
    const files = formData.getAll('files') as File[];

    if (!title || !targetId || files.length === 0) {
      return NextResponse.json(
        { message: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }

    // Get teacher ID
    const teacher = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [user.id]
    );

    if (!teacher.length) {
      return NextResponse.json(
        { message: 'لم يتم العثور على بيانات المعلم' },
        { status: 404 }
      );
    }

    const teacherId = teacher[0].id;

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'materials');
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles: string[] = [];

    // Upload each file
    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/*', 'application/pdf', 'audio/*', 'video/*'];
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        return NextResponse.json(
          { message: `نوع الملف ${file.name} غير مدعوم` },
          { status: 400 }
        );
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { message: `حجم الملف ${file.name} أكبر من الحد المسموح` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);

      // Convert File to Buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      uploadedFiles.push(fileName);
    }

    // Determine file kind based on first file
    const firstFile = files[0];
    let kind = 'PDF';
    if (firstFile.type.startsWith('audio/')) {
      kind = 'AUDIO';
    } else if (firstFile.type.startsWith('video/')) {
      kind = 'VIDEO';
    }

    // Create material record (use level instead of stage_id in current schema)
    const materialId = uuidv4();
    await executeUpdate(`
      INSERT INTO materials (
        id, teacher_id, title, level, file_url, kind, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      materialId,
      teacherId,
      title,
      targetId,
      JSON.stringify(uploadedFiles),
      kind,
    ]);

    // Get the created material
    const createdMaterial = await executeQuery(`
      SELECT 
        m.*,
        u.email as teacher_name
      FROM materials m
      JOIN teachers t ON m.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE m.id = ?
    `, [materialId]);

    return NextResponse.json({
      message: 'تم رفع المادة التعليمية بنجاح',
      material: createdMaterial[0]
    });

  } catch (error) {
    console.error('Material upload error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في رفع المادة التعليمية' },
      { status: 500 }
    );
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

    const materials = await executeQuery(query, params);

    return NextResponse.json(materials);

  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل المواد التعليمية' },
      { status: 500 }
    );
  }
}
