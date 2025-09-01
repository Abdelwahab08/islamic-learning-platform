import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeUpdate } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالموافقة على المستخدمين' },
        { status: 403 }
      )
    }

    const userId = params.id

                    // Update user approval status
                const result = await executeUpdate(
                  'UPDATE users SET is_approved = 1, onboarding_status = "ACTIVE" WHERE id = ?',
                  [userId]
                )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'تم الموافقة على المستخدم بنجاح'
    })

  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الموافقة على المستخدم' },
      { status: 500 }
    )
  }
}
