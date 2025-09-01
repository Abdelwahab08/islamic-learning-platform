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

    // Return static data without any database queries
    return NextResponse.json({
      message: 'Simple student API is working!',
      user: {
        id: user.id,
        role: user.role
      },
      data: {
        assignments: [
          { id: 1, title: 'واجب تجريبي 1', status: 'pending' },
          { id: 2, title: 'واجب تجريبي 2', status: 'submitted' }
        ],
        certificates: [
          { id: 1, title: 'شهادة تجريبية 1', issued_at: new Date().toISOString() },
          { id: 2, title: 'شهادة تجريبية 2', issued_at: new Date().toISOString() }
        ],
        meetings: [
          { id: 1, title: 'اجتماع تجريبي 1', scheduled_at: new Date().toISOString() },
          { id: 2, title: 'اجتماع تجريبي 2', scheduled_at: new Date().toISOString() }
        ],
        materials: [
          { id: 1, title: 'مادة تجريبية 1', fileUrl: '/test.pdf' },
          { id: 2, title: 'مادة تجريبية 2', fileUrl: '/test2.pdf' }
        ]
      }
    })
  } catch (error: any) {
    console.error('Error in simple API:', error)
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
