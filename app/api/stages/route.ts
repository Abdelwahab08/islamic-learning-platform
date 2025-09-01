import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const stagesQuery = `
      SELECT id, code, name_ar, total_pages, order_index
      FROM stages
      ORDER BY order_index ASC
    `

    const stages = await executeQuery(stagesQuery)

    const transformedStages = stages.map((stage: any) => ({
      id: stage.id,
      code: stage.code,
      name_ar: stage.name_ar,
      total_pages: stage.total_pages,
      order_index: stage.order_index
    }))

    return NextResponse.json({
      stages: transformedStages,
      total: transformedStages.length
    })

  } catch (error) {
    console.error('Error fetching stages:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل المراحل' },
      { status: 500 }
    )
  }
}
