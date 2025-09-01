import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth-server'
import { executeQuerySingle, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const phoneNumber = formData.get('phoneNumber') as string || null
    const bio = formData.get('bio') as string || null
    const cvFile = formData.get('cvFile') as File | null

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: 'الاسم الكامل والبريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await executeQuerySingle(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Handle CV file upload
    let cvFileName = null
    if (cvFile) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'teachers')
        await mkdir(uploadsDir, { recursive: true })

        // Generate unique filename
        const fileExtension = cvFile.name.split('.').pop()
        cvFileName = `${uuidv4()}.${fileExtension}`
        const filePath = join(uploadsDir, cvFileName)

        // Convert File to Buffer and save
        const bytes = await cvFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)
      } catch (error) {
        console.error('File upload error:', error)
        return NextResponse.json(
          { message: 'حدث خطأ في رفع الملف' },
          { status: 500 }
        )
      }
    }

    // Create user
    const userId = uuidv4()
    await executeUpdate(
      'INSERT INTO users (id, role, email, password_hash, is_approved, onboarding_status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'TEACHER', email, passwordHash, 0, 'PENDING_REVIEW']
    )

    // Create teacher record with new fields
    const teacherId = uuidv4()
    await executeUpdate(
      'INSERT INTO teachers (id, user_id, full_name, phone_number, bio, cv_file, verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [teacherId, userId, fullName, phoneNumber, bio, cvFileName, 0]
    )

    return NextResponse.json({
      message: 'تم تقديم طلبك بنجاح',
      userId: userId,
    })

  } catch (error) {
    console.error('Teacher application error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
