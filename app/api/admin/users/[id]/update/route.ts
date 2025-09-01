import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeUpdate, executeQuerySingle } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بتعديل المستخدمين' },
        { status: 403 }
      )
    }

    const userId = params.id
    const { email, role, additionalData } = await request.json()

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني والدور مطلوبان' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await executeQuerySingle(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    )

    if (!existingUser) {
      return NextResponse.json(
        { message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Update user basic information
    await executeUpdate(
      'UPDATE users SET email = ?, role = ? WHERE id = ?',
      [email, role, userId]
    )

    // Handle role-specific updates
    if (role === 'TEACHER' && existingUser.role !== 'TEACHER') {
      // Convert to teacher
      await executeUpdate(
        'INSERT INTO teachers (id, user_id, verified) VALUES (UUID(), ?, 0)',
        [userId]
      )
    } else if (role === 'STUDENT' && existingUser.role !== 'STUDENT') {
      // Convert to student
      await executeUpdate(
        'INSERT INTO students (id, user_id, current_stage_id, current_page) VALUES (UUID(), ?, 1, 1)',
        [userId]
      )
    }

    // Update role-specific data if provided
    if (additionalData) {
      if (role === 'TEACHER' && additionalData.verified !== undefined) {
        await executeUpdate(
          'UPDATE teachers SET verified = ? WHERE user_id = ?',
          [additionalData.verified ? 1 : 0, userId]
        )
      } else if (role === 'STUDENT' && additionalData.currentStageId) {
        await executeUpdate(
          'UPDATE students SET current_stage_id = ?, current_page = 1 WHERE user_id = ?',
          [additionalData.currentStageId, userId]
        )
      }
    }

    return NextResponse.json({
      message: 'تم تحديث المستخدم بنجاح'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحديث المستخدم' },
      { status: 500 }
    )
  }
}
