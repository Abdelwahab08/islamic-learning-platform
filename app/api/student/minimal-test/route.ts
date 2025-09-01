import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Minimal test API is working!',
    timestamp: new Date().toISOString()
  })
}
