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

    // Return static test data
    return NextResponse.json({
      message: 'Student API is working!',
      user: {
        id: user.id,
        role: user.role
      },
      testData: {
        assignments: [
          { id: 1, title: 'واجب تجريبي', status: 'pending' }
        ],
        certificates: [
          { id: 1, title: 'شهادة تجريبية', issued_at: new Date().toISOString() }
        ],
        meetings: [
          { id: 1, title: 'اجتماع تجريبي', scheduled_at: new Date().toISOString() }
        ]
      }
    })
  } catch (error: any) {
    console.error('Error in test API:', error)
    return NextResponse.json(
      { 
        message: 'حدث خطأ في الخادم', 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
