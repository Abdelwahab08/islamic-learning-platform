import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'غير مصرح' },
        { status: 403 }
      )
    }

    // Return simple static data
    return NextResponse.json({
      message: 'Simple test API is working!',
      user: {
        id: user.id,
        role: user.role
      },
      test: 'This is a simple test response'
    })
    
  } catch (error: any) {
    console.error('Error in simple test API:', error)
    return NextResponse.json(
      { 
        message: 'حدث خطأ في الخادم', 
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
