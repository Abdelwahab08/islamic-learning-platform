import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'
import { v4 as uuidv4 } from 'uuid'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const complaintId = params.id

    // Check if user has access to this complaint
    let hasAccess = false
    if (user.role === 'STUDENT') {
      const complaint = await executeQuery(
        'SELECT id FROM complaints WHERE id = ? AND user_id = ?',
        [complaintId, user.id]
      )
      hasAccess = complaint.length > 0
    } else if (user.role === 'ADMIN') {
      hasAccess = true
    }

    if (!hasAccess) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    // For now, return empty array since we don't have a replies table
    // In a real implementation, you would query the replies table
    return NextResponse.json([])

  } catch (error) {
    console.error('Complaint replies error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const complaintId = params.id
    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ message: 'الرسالة مطلوبة' }, { status: 400 })
    }

    // Check if user has access to this complaint
    let hasAccess = false
    if (user.role === 'STUDENT') {
      const complaint = await executeQuery(
        'SELECT id FROM complaints WHERE id = ? AND user_id = ?',
        [complaintId, user.id]
      )
      hasAccess = complaint.length > 0
    } else if (user.role === 'ADMIN') {
      hasAccess = true
    }

    if (!hasAccess) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    // For now, just return success since we don't have a replies table
    // In a real implementation, you would insert into the replies table
    return NextResponse.json({ 
      message: 'تم إرسال الرد بنجاح',
      id: uuidv4()
    })

  } catch (error) {
    console.error('Create reply error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
