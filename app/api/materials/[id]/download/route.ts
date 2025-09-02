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

    // Parse file_url to get filename and path
    let filename = 'sample-material.pdf' // default
    let filePath = ''
    
    try {
      if (material.file_url) {
        // Handle both JSON array and string formats
        if (material.file_url.startsWith('[')) {
          const fileUrls = JSON.parse(material.file_url)
          if (Array.isArray(fileUrls) && fileUrls.length > 0) {
            filename = fileUrls[0]
          }
        } else {
          // Handle direct string path like "/materials/file.pdf"
          filename = material.file_url.split('/').pop() || 'sample-material.pdf'
        }
      }
    } catch (error) {
      console.error('Error parsing file_url:', error)
    }

    // Try to construct file path - handle both local and production scenarios
    const localPath = path.join(process.cwd(), 'uploads', 'materials', filename)
    const publicPath = path.join(process.cwd(), 'public', filename.replace('/materials/', ''))
    
    let fileBuffer: Buffer | null = null
    let finalPath = ''

    try {
      // First try local uploads folder
      await fs.access(localPath)
      fileBuffer = await fs.readFile(localPath)
      finalPath = localPath
    } catch (localError) {
      try {
        // Try public folder (for production)
        await fs.access(publicPath)
        fileBuffer = await fs.readFile(publicPath)
        finalPath = publicPath
      } catch (publicError) {
        // If neither exists, return error with helpful message
        console.error('File not found in local or public folders:', { localPath, publicPath })
        return NextResponse.json(
          { 
            message: 'الملف غير متوفر للتحميل حالياً',
            details: 'يرجى التواصل مع الإدارة لتحديث الملف'
          },
          { status: 404 }
        )
      }
    }

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

  } catch (error) {
    console.error('Material download error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل المادة' },
      { status: 500 }
    )
  }
}
