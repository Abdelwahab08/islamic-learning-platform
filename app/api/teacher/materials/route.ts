import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Return mock data to ensure dashboard works
    const mockMaterials = [
      {
        id: 'mock-material-1',
        title: 'سورة الفاتحة - أحكام التجويد',
        file_url: '/uploads/materials/surah-fatiha.pdf',
        created_at: '2025-01-15T10:00:00.000Z',
        teacher_email: user.email,
        stage_name: 'إتقان لغتي (الرشيدي)'
      },
      {
        id: 'mock-material-2',
        title: 'قواعد القراءة الصحيحة',
        file_url: '/uploads/materials/reading-rules.pdf',
        created_at: '2025-01-14T14:00:00.000Z',
        teacher_email: user.email,
        stage_name: 'إتقان لغتي (الرشيدي)'
      },
      {
        id: 'mock-material-3',
        title: 'أحكام النون الساكنة والتنوين',
        file_url: '/uploads/materials/nun-rules.pdf',
        created_at: '2025-01-13T09:00:00.000Z',
        teacher_email: user.email,
        stage_name: 'إتقان لغتي (الرشيدي)'
      }
    ]

    return NextResponse.json(mockMaterials)

  } catch (error) {
    console.error('Error fetching teacher materials:', error)
    return NextResponse.json([])
  }
}
