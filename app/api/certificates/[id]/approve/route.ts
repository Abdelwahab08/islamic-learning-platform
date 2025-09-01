import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { executeUpdate, executeQuerySingle } from '@/lib/db';
import { generateCertificatePDF, formatDate } from '@/lib/certificate-generator';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالموافقة على الشهادات' },
        { status: 403 }
      );
    }

    const certificateId = params.id;

    // Get certificate details
    const certificate = await executeQuerySingle(`
      SELECT 
        c.*,
        su.email as student_email,
        tu.email as teacher_email,
        st.name_ar as stage_name
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN users su ON s.user_id = su.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users tu ON t.user_id = tu.id
      JOIN stages st ON c.stage_id = st.id
      WHERE c.id = ?
    `, [certificateId]);

    if (!certificate) {
      return NextResponse.json(
        { message: 'الشهادة غير موجودة' },
        { status: 404 }
      );
    }

    if (certificate.status === 'APPROVED') {
      return NextResponse.json(
        { message: 'تم الموافقة على هذه الشهادة مسبقاً' },
        { status: 400 }
      );
    }

    // Generate HTML certificate
    const certificateData = {
      studentName: certificate.student_email,
      teacherName: certificate.teacher_email,
      stageName: certificate.stage_name,
      completionDate: formatDate(new Date()),
      certificateId: certificate.id,
      quranPortion: `مرحلة ${certificate.stage_name}`
    };

    const htmlBuffer = await generateCertificatePDF(certificateData);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'certificates');
    await mkdir(uploadDir, { recursive: true });

    // Save HTML file
    const fileName = `certificate_${certificate.id}.html`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, htmlBuffer);

    // Update certificate status
    await executeUpdate(`
      UPDATE certificates 
      SET status = 'APPROVED', 
          approved_at = NOW(),
          pdf_url = ?
      WHERE id = ?
    `, [fileName, certificateId]);

    return NextResponse.json({
      message: 'تم الموافقة على الشهادة بنجاح',
      certificateId,
      fileName
    });

  } catch (error) {
    console.error('Certificate approval error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في الموافقة على الشهادة' },
      { status: 500 }
    );
  }
}

