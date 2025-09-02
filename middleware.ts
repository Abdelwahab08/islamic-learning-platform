import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register-student',
    '/auth/apply-teacher',
    '/auth/awaiting-approval',
    '/about',
    '/quran',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/apply-teacher',
    '/api/quran/daily-ayah',
    '/api/toasts/active',
    // Temporary: Add Groups API for testing
    '/api/teacher/groups',
  ]

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For now, just allow access if token exists
  // Token verification will be handled by individual API routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
