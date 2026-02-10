import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si l'utilisateur est authentifié via les cookies de session
  const token = request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token')

  // Si l'utilisateur essaie d'accéder au dashboard sans être connecté
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si l'utilisateur est connecté et essaie d'accéder à login/register
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
