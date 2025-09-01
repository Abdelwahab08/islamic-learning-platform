import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { generateCertificatePDF } from '@/lib/certificate-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = params.id;

    console.log('Fetching certificate with ID:', certificateId);
    
    // Get certificate with all related data
    const result = await executeQuery(`
      SELECT 
        c.id,
        c.serial,
        c.grade,
        c.issued_at,
        c.status,
        st.name_ar as stage_name,
        s.user_id as student_user_id,
        CONCAT(COALESCE(su.first_name, ''), ' ', COALESCE(su.last_name, '')) as student_name,
        su.email as student_email,
        t.user_id as teacher_user_id,
        tu.email as teacher_email
      FROM certificates c
      JOIN stages st ON c.stage_id = st.id
      JOIN students s ON c.student_id = s.id
      JOIN users su ON s.user_id = su.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users tu ON t.user_id = tu.id
      WHERE c.id = ? AND c.status = 'APPROVED'
    `, [certificateId]);
    
    console.log('Query result:', result);
    
    // Handle the result correctly - it might be an array or object
    const certificates = Array.isArray(result) ? result : [result];

    if (certificates.length === 0) {
      return NextResponse.json(
        { error: 'الشهادة غير موجودة أو غير معتمدة' },
        { status: 404 }
      );
    }

    console.log('Certificates found:', certificates.length);
    const certificate = certificates[0];
    
    if (!certificate) {
      console.error('Certificate is undefined');
      return NextResponse.json(
        { error: 'بيانات الشهادة غير صحيحة' },
        { status: 500 }
      );
    }
    
    console.log('Certificate data from database:', certificate);

    // Validate required fields
    if (!certificate.issued_at) {
      console.error('Certificate issued_at is missing');
      return NextResponse.json(
        { error: 'تاريخ الإصدار مفقود' },
        { status: 500 }
      );
    }

    if (!certificate.stage_name) {
      console.error('Certificate stage_name is missing');
      return NextResponse.json(
        { error: 'اسم المرحلة مفقود' },
        { status: 500 }
      );
    }

    // Format the completion date in Arabic
    const completionDate = new Date(certificate.issued_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create certificate data object with all required fields
    const certificateData = {
      studentName: certificate.student_name || certificate.student_email,
      teacherName: certificate.teacher_email,
      stageName: certificate.stage_name,
      completionDate: completionDate,
      certificateId: certificate.id,
      grade: certificate.grade,
      serial: certificate.serial
    };

    console.log('Certificate data being generated:', certificateData);

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(certificateData);

    // Return PDF with proper headers
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificate.serial}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الشهادة' },
      { status: 500 }
    );
  }
}
