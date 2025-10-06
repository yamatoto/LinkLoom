import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 認証を必要としないPublic routes
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // クッキーからトークンを取得
  const token = request.cookies.get('sb-access-token')

  // 認証が必要なルートにアクセスしているがトークンがない場合、ログインページにリダイレクト
  if (!isPublicRoute && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 認証済みのユーザーがログイン/サインアップページにアクセスした場合、ホームページにリダイレクト
  if (isPublicRoute && token) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 以下のパスを除いて、すべてのリクエストパスにマッチ
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
