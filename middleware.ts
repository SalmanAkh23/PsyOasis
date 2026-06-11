import { NextRequest, NextResponse } from 'next/server'

// Server-side route protection middleware for PsyOasis
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check for common auth signals: cookie (token or __session) or Authorization header
  const tokenCookie = req.cookies.get('psyoasis_token')?.value || req.cookies.get('token')?.value || req.cookies.get('__session')?.value || ''
  const authHeader = req.headers.get('authorization') || ''
  const isAuthenticated = Boolean(tokenCookie || authHeader.toLowerCase().startsWith('bearer '))

  // If visiting root and authenticated, send to /dashboard
  if (pathname === '/') {
    if (isAuthenticated) {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Protect these prefixes server-side
  const protectedPrefixes = ['/dashboard', '/konsultasi', '/profile', '/booking']
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      // preserve original route to redirect back after login
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Only run middleware for intended routes
export const config = {
  matcher: ['/', '/dashboard/:path*', '/konsultasi/:path*', '/profile/:path*', '/booking/:path*'],
}
