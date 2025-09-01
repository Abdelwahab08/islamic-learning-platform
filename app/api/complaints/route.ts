import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeUpdate } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    let complaints
    if (user.role === 'STUDENT') {
      // Get student complaints
      complaints = await executeQuery(`
        SELECT 
          c.id,
          c.subject as title,
          c.body as description,
          'GENERAL' as category,
          'PENDING' as status,
          'MEDIUM' as priority,
          c.created_at,
          c.created_at as updated_at,
          0 as replies_count
        FROM complaints c
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `, [user.id])
    } else if (user.role === 'ADMIN') {
      // Get all complaints for admin
      complaints = await executeQuery(`
        SELECT 
          c.id,
          c.subject as title,
          c.body as description,
          'GENERAL' as category,
          'PENDING' as status,
          'MEDIUM' as priority,
          c.created_at,
          c.created_at as updated_at,
          0 as replies_count,
          u.email as student_name
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
      `)
    } else {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    return NextResponse.json(complaints)

  } catch (error) {
    console.error('Complaints error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title || !description) {
      return NextResponse.json({ message: 'العنوان والمحتوى مطلوبان' }, { status: 400 })
    }

    const complaintId = uuidv4()

    await executeUpdate(`
      INSERT INTO complaints (id, user_id, subject, body, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [complaintId, user.id, title, description])

    return NextResponse.json({ 
      message: 'تم إرسال الشكوى بنجاح',
      id: complaintId 
    })

  } catch (error) {
    console.error('Create complaint error:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
