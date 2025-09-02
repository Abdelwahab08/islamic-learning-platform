import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول لهذه البيانات' },
        { status: 403 }
      )
    }

    const rootDir = process.cwd()
    const debugInfo: {
      rootDirectory: string
      currentWorkingDirectory: string
      possibleFileLocations: string[]
      existingFiles: Record<string, any>
      fileSystemInfo: Record<string, any>
    } = {
      rootDirectory: rootDir,
      currentWorkingDirectory: process.cwd(),
      possibleFileLocations: [],
      existingFiles: {},
      fileSystemInfo: {}
    }

    // Check common directories
    const directoriesToCheck = [
      'uploads',
      'uploads/materials',
      'uploads/certificates',
      'public',
      'public/materials',
      'public/certificates'
    ]

    for (const dir of directoriesToCheck) {
      const fullPath = path.join(rootDir, dir)
      try {
        const files = await fs.readdir(fullPath)
        debugInfo.existingFiles[dir] = files
        debugInfo.possibleFileLocations.push(dir)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        debugInfo.existingFiles[dir] = `Directory not found: ${errorMessage}`
      }
    }

    // Check if specific files mentioned in the error exist
    const specificFiles = [
      'certificate-c-1756757954252-2.pdf',
      'tajweed-basic.pdf',
      'nun-rules.pdf'
    ]

    for (const file of specificFiles) {
      const fileLocations: Record<string, string> = {}
      for (const dir of directoriesToCheck) {
        const fullPath = path.join(rootDir, dir, file)
        try {
          await fs.access(fullPath)
          fileLocations[dir] = 'EXISTS'
        } catch (error) {
          fileLocations[dir] = 'NOT_FOUND'
        }
      }
      debugInfo.fileSystemInfo[file] = fileLocations
    }

    // Get some system info
    try {
      const packageJson = await fs.readFile(path.join(rootDir, 'package.json'), 'utf8')
      debugInfo.fileSystemInfo['package.json'] = 'EXISTS'
    } catch (error) {
      debugInfo.fileSystemInfo['package.json'] = 'NOT_FOUND'
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Debug endpoint error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { 
        message: 'حدث خطأ في جلب معلومات التصحيح',
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
