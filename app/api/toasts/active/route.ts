import { NextResponse } from 'next/server'
import { executeQuerySingle } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    
    // Get active toast banner
    const toast = await executeQuerySingle(`
      SELECT id, title, body
      FROM admin_toasts
      WHERE active = 1
      AND (starts_at IS NULL OR starts_at <= ?)
      AND (ends_at IS NULL OR ends_at >= ?)
      ORDER BY created_at DESC
      LIMIT 1
    `, [now, now])

    if (!toast) {
      return NextResponse.json(null)
    }

    return NextResponse.json(toast)

  } catch (error) {
    console.error('Active toast error:', error)
    return NextResponse.json(null)
  }
}
