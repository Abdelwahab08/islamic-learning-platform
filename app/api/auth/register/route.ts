import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth-server'
import { executeQuerySingle, executeUpdate } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    if (role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'نوع المستخدم غير صحيح' },
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

    // Get default stage ID (RASHIDI - المرحلة الابتدائية)
    const defaultStage = await executeQuerySingle(
      'SELECT id FROM stages WHERE code = ?',
      ['RASHIDI']
    )

    if (!defaultStage) {
      return NextResponse.json(
        { message: 'خطأ في إعداد المرحلة الافتراضية' },
        { status: 500 }
      )
    }

    // Create user with pending approval
    const userId = uuidv4()
    await executeUpdate(
      'INSERT INTO users (id, role, email, password_hash, is_approved, onboarding_status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, role, email, passwordHash, 0, 'PENDING']
    )

    // Create student record with default stage and page
    const studentId = uuidv4()
    await executeUpdate(
      'INSERT INTO students (id, user_id, stage_id, current_page) VALUES (?, ?, ?, ?)',
      [studentId, userId, defaultStage.id, 1]
    )

    return NextResponse.json({
      message: 'تم التسجيل بنجاح! سيتم مراجعة طلبك قريباً',
      userId: userId,
      stage: 'RASHIDI',
      stageName: 'إتقان لغتي (الرشيدي)',
      currentPage: 1
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
