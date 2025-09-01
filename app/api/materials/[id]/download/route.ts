import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuerySingle } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح لك بتحميل المواد' },
        { status: 403 }
      )
    }

    const materialId = params.id

    // Get material details
    const material = await executeQuerySingle(`
      SELECT 
        m.*,
        s.user_id as student_user_id,
        t.user_id as teacher_user_id
      FROM materials m
      LEFT JOIN students s ON m.stage_id = s.current_stage_id
      LEFT JOIN teachers t ON m.teacher_id = t.id
      WHERE m.id = ?
    `, [materialId])

    if (!material) {
      return NextResponse.json(
        { message: 'المادة غير موجودة' },
        { status: 404 }
      )
    }

    // Check permissions - students can download materials for their stage
    const canDownload = 
      user.role === 'ADMIN' ||
      (user.role === 'TEACHER' && material.teacher_user_id === user.id) ||
      (user.role === 'STUDENT' && material.student_user_id === user.id)

    if (!canDownload) {
      return NextResponse.json(
        { message: 'غير مصرح لك بتحميل هذه المادة' },
        { status: 403 }
      )
    }

    // Parse file_url to get filename
    let filename = 'sample-material.pdf' // default
    try {
      if (material.file_url) {
        const fileUrls = JSON.parse(material.file_url)
        if (Array.isArray(fileUrls) && fileUrls.length > 0) {
          filename = fileUrls[0]
        }
      }
    } catch (error) {
      console.error('Error parsing file_url:', error)
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', 'materials', filename)

    try {
      // Check if file exists
      await fs.access(filePath)
      
      // Read file
      const fileBuffer = await fs.readFile(filePath)
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase()
      let contentType = 'application/octet-stream'
      
      if (ext === '.pdf') contentType = 'application/pdf'
      else if (ext === '.mp4' || ext === '.avi' || ext === '.mov') contentType = 'video/mp4'
      else if (ext === '.mp3' || ext === '.wav') contentType = 'audio/mpeg'
      else if (ext === '.doc' || ext === '.docx') contentType = 'application/msword'
      else if (ext === '.txt') contentType = 'text/plain'

      return new NextResponse(Buffer.from(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } catch (fileError) {
      console.error('Error reading file:', fileError)
      return NextResponse.json(
        { message: 'خطأ في قراءة الملف' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Material download error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل المادة' },
      { status: 500 }
    )
  }
}
