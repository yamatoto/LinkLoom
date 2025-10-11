import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'
import { isDevAuthBypassEnabled, validateRedirectPath } from '@/lib/auth-helpers'
import { AUTH, ROUTES } from '@/lib/constants'
import { logger } from '@/lib/logger'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 開発環境での認証バイパス（Chrome DevTools MCP用）
  if (isDevAuthBypassEnabled()) {
    logger.log('[middleware] DEV_AUTH_BYPASS enabled, skipping auth check for:', pathname)
    return NextResponse.next({
      request,
    })
  }

  // 認証を必要としないPublic routes
  const isPublicRoute = AUTH.PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  // Supabase SSRクライアントを作成
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // セッションを取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証が必要なルートにアクセスしているがセッションがない場合、ログインページにリダイレクト
  if (!isPublicRoute && !session) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.LOGIN
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 認証済みのユーザーがログインページにアクセスした場合、ホームにリダイレクト
  if (session && pathname === ROUTES.LOGIN) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const safeRedirect = validateRedirectPath(redirectParam)
    const url = request.nextUrl.clone()
    url.pathname = safeRedirect
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return supabaseResponse
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
