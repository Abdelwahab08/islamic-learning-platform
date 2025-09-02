import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeUpdate, executeQuery } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بتعديل إعدادات النظام' },
        { status: 403 }
      )
    }

    const settings = await request.json()

    // Update admin_toasts table with new settings
    // First get the ID, then update to avoid MySQL subquery restriction
    const [toastResult] = await executeQuery('SELECT id FROM admin_toasts LIMIT 1')
    if (toastResult && toastResult.length > 0) {
      const toastId = toastResult[0].id
      await executeUpdate(`
        UPDATE admin_toasts 
        SET title = ?, body = ?
        WHERE id = ?
      `, [settings.siteName, settings.siteDescription, toastId])
    } else {
      // Create new admin_toast if none exists
      await executeUpdate(`
        INSERT INTO admin_toasts (id, title, body, created_at) 
        VALUES (UUID(), ?, ?, NOW())
      `, [settings.siteName, settings.siteDescription])
    }

    return NextResponse.json({
      message: 'تم حفظ الإعدادات بنجاح',
      settings
    })

  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في حفظ الإعدادات' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'غير مصرح لك بالوصول إلى إعدادات النظام' },
        { status: 403 }
      )
    }

    // Return default settings
    const settings = {
      siteName: 'منصة التعلم الإسلامي',
      siteDescription: 'منصة تعليمية متخصصة في العلوم الإسلامية',
      contactEmail: 'admin@islamic.edu',
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'mp3', 'mp4', 'doc', 'docx'],
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      defaultLanguage: 'ar',
      theme: 'default'
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في تحميل الإعدادات' },
      { status: 500 }
    )
  }
}
