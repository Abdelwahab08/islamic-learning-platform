import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth-server'

export async function POST() {
  try {
    await clearAuthCookie()
    return NextResponse.json({ message: 'تم مسح الكوكي بنجاح' })

  } catch (error) {
    console.error('Clear cookie error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
