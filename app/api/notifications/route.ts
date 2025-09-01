import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const notifications = await executeQuery(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [user.id]
    )

    return NextResponse.json(notifications)

  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { message: 'معرف الإشعار مطلوب' },
        { status: 400 }
      )
    }

    // Mark notification as read
    await executeQuery(
      'UPDATE notifications SET read_flag = 1 WHERE id = ? AND user_id = ?',
      [notificationId, user.id]
    )

    return NextResponse.json({ message: 'تم تحديث الإشعار' })

  } catch (error) {
    console.error('Mark notification read error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
