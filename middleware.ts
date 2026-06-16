import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const tokenCookie = req.cookies.get('psyoasis_auth')?.value || ''
  const authHeader = req.headers.get('authorization') || ''
  const isAuthenticated = Boolean(tokenCookie || authHeader.toLowerCase().startsWith('bearer '))

  if (pathname === '/') {
    if (isAuthenticated) {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname !== '/admin/login' && !isAuthenticated) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const protectedPrefixes = ['/konsultasi', '/profile', '/booking']
  if (protectedPrefixes.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/konsultasi/:path*', '/profile/:path*', '/booking/:path*', '/dashboard/:path*'],
}
