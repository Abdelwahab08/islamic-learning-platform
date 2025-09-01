import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { executeUpdate } from '@/lib/db'

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
    await executeUpdate(`
      UPDATE admin_toasts 
      SET title = ?, body = ?
      WHERE id = (SELECT id FROM admin_toasts LIMIT 1)
    `, [settings.siteName, settings.siteDescription])

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
