import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeQuery, executeUpdate } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    const materialId = params.id
    const body = await request.json()
    const { title, kind, level } = body || {}

    // Get material owner
    const material = await executeQuery(
      `SELECT m.id, t.user_id as owner_user_id
       FROM materials m
       JOIN teachers t ON m.teacher_id = t.id
       WHERE m.id = ?`,
      [materialId]
    )

    if (!material.length) {
      return NextResponse.json({ message: 'المادة غير موجودة' }, { status: 404 })
    }

    const isOwnerTeacher = material[0].owner_user_id === user.id
    const isAdmin = user.role === 'ADMIN'
    if (!isAdmin && !(user.role === 'TEACHER' && isOwnerTeacher)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    const fields: string[] = []
    const paramsArr: any[] = []
    if (typeof title === 'string' && title.trim().length > 0) {
      fields.push('title = ?')
      paramsArr.push(title.trim())
    }
    if (typeof kind === 'string' && kind.trim().length > 0) {
      fields.push('kind = ?')
      paramsArr.push(kind.trim())
    }
    if (typeof level === 'string' && level.trim().length > 0) {
      fields.push('level = ?')
      paramsArr.push(level.trim())
    }

    if (fields.length === 0) {
      return NextResponse.json({ message: 'لا يوجد تحديثات' }, { status: 400 })
    }

    paramsArr.push(materialId)

    await executeUpdate(
      `UPDATE materials SET ${fields.join(', ')} WHERE id = ?`,
      paramsArr
    )

    return NextResponse.json({ message: 'تم التحديث بنجاح' })
  } catch (error: any) {
    console.error('Update material error:', error)
    return NextResponse.json({ message: 'حدث خطأ في التحديث' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    const materialId = params.id

    // Get material owner
    const material = await executeQuery(
      `SELECT m.id, t.user_id as owner_user_id
       FROM materials m
       JOIN teachers t ON m.teacher_id = t.id
       WHERE m.id = ?`,
      [materialId]
    )

    if (!material.length) {
      return NextResponse.json({ message: 'المادة غير موجودة' }, { status: 404 })
    }

    const isOwnerTeacher = material[0].owner_user_id === user.id
    const isAdmin = user.role === 'ADMIN'
    if (!isAdmin && !(user.role === 'TEACHER' && isOwnerTeacher)) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 })
    }

    await executeUpdate('DELETE FROM materials WHERE id = ?', [materialId])

    return NextResponse.json({ message: 'تم الحذف بنجاح' })
  } catch (error: any) {
    console.error('Delete material error:', error)
    return NextResponse.json({ message: 'حدث خطأ في الحذف' }, { status: 500 })
  }
}
