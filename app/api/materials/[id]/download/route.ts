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
    let isExternalUrl = false
    
    try {
      if (material.file_url) {
        // Check if it's an external URL
        if (material.file_url.startsWith('http://') || material.file_url.startsWith('https://')) {
          isExternalUrl = true
          filename = material.file_url.split('/').pop() || 'external-file'
        } else if (material.file_url.startsWith('[')) {
          // Handle JSON array format
          const fileUrls = JSON.parse(material.file_url)
          if (Array.isArray(fileUrls) && fileUrls.length > 0) {
            const firstUrl = fileUrls[0]
            if (firstUrl.startsWith('http://') || firstUrl.startsWith('https://')) {
              isExternalUrl = true
              filename = firstUrl.split('/').pop() || 'external-file'
            } else {
              filename = firstUrl
            }
          }
        } else {
          // Handle direct string path like "/materials/file.pdf"
          filename = material.file_url.split('/').pop() || 'sample-material.pdf'
        }
      }
    } catch (error) {
      console.error('Error parsing file_url:', error)
    }

    // If it's an external URL, redirect to it
    if (isExternalUrl) {
      return NextResponse.redirect(material.file_url)
    }

    // Try to construct file path - handle multiple possible locations
    const possiblePaths = [
      // Try the exact path from file_url
      path.join(process.cwd(), material.file_url.replace(/^\//, '')),
      // Try uploads/materials folder
      path.join(process.cwd(), 'uploads', 'materials', filename),
      // Try uploads folder (for certificates)
      path.join(process.cwd(), 'uploads', filename),
      // Try public folder
      path.join(process.cwd(), 'public', filename),
      // Try public/materials folder
      path.join(process.cwd(), 'public', 'materials', filename)
    ]
    
    let fileBuffer: Buffer | null = null
    let finalPath = ''

    // Try each possible path
    for (const filePath of possiblePaths) {
      try {
        await fs.access(filePath)
        fileBuffer = await fs.readFile(filePath)
        finalPath = filePath
        console.log('File found at:', filePath)
        break
      } catch (error) {
        console.log('File not found at:', filePath)
        continue
      }
    }

    if (!fileBuffer) {
      // If no file found, return error with helpful message
      console.error('File not found in any of these locations:', possiblePaths)
      return NextResponse.json(
        { 
          message: 'الملف غير متوفر للتحميل حالياً',
          details: 'يرجى التواصل مع الإدارة لتحديث الملف',
          searchedPaths: possiblePaths.map(p => p.replace(process.cwd(), ''))
        },
        { status: 404 }
      )
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
