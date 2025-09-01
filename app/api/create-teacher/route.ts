import { NextResponse } from 'next/server'
import { executeQuery, executeUpdate } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const email = 'teacher@yaqeen.edu'
    const password = 'teacher123'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id, role, is_approved FROM users WHERE email = ?',
      [email]
    )

    let userId: string
    if (existingUser.length > 0) {
      userId = existingUser[0].id
      
      // Update to ensure approved and teacher role
      await executeUpdate(
        'UPDATE users SET role = ?, is_approved = ?, onboarding_status = ?, password_hash = ? WHERE id = ?',
        ['TEACHER', true, 'ACTIVE', hashedPassword, userId]
      )
    } else {
      // Create new user
      userId = uuidv4()
      await executeUpdate(`
        INSERT INTO users (id, email, password_hash, role, is_approved, onboarding_status, first_name, last_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [userId, email, hashedPassword, 'TEACHER', true, 'ACTIVE', 'معلم', 'تجريبي'])
    }

    // Check if teacher profile exists
    const existingTeacher = await executeQuery(
      'SELECT id FROM teachers WHERE user_id = ?',
      [userId]
    )

    let teacherId: string
    if (existingTeacher.length > 0) {
      teacherId = existingTeacher[0].id
    } else {
      // Create teacher profile
      teacherId = uuidv4()
      await executeUpdate(`
        INSERT INTO teachers (id, user_id, specialization, bio, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [teacherId, userId, 'تعليم القرآن الكريم', 'معلم تجريبي لاختبار النظام'])
    }

    // Verify the account
    const verifyUser = await executeQuery(
      `SELECT u.id, u.email, u.role, u.is_approved, u.onboarding_status, t.id as teacher_id
       FROM users u
       LEFT JOIN teachers t ON u.id = t.user_id
       WHERE u.email = ?`,
      [email]
    )

    if (verifyUser.length > 0) {
      const user = verifyUser[0]
      return NextResponse.json({
        success: true,
        message: 'Teacher account created/updated successfully',
        credentials: {
          email: email,
          password: password,
          role: user.role,
          approved: user.is_approved,
          status: user.onboarding_status,
          userId: user.id,
          teacherId: user.teacher_id
        },
        loginUrl: 'https://acceptable-acceptance-production.up.railway.app/auth/login'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to verify created account'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error creating teacher account:', error)
    return NextResponse.json({
      success: false,
      message: 'Error creating teacher account',
      error: String(error?.message || error)
    }, { status: 500 })
  }
}
