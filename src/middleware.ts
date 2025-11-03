import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'
import { validateRedirectPath } from '@/lib/auth-helpers'
import { AUTH, ROUTES } from '@/lib/constants'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 認証を必要としないPublic routes
  const isPublicRoute = AUTH.PUBLIC_ROUTES.some((route) => {
    if (route === ROUTES.HOME) {
      return pathname === ROUTES.HOME
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })

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
          // リクエストCookieを更新（Server Actionsで読み取れるように）
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // レスポンスを再作成
          supabaseResponse = NextResponse.next({
            request,
          })
          // レスポンスCookieを設定（ブラウザに返すため）
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: ユーザー情報を取得してセッションを再検証
  // この呼び出しにより、期限切れトークンが自動的にリフレッシュされる
  // setAllコールバックが呼ばれ、リクエストとレスポンスのCookieが更新される
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 認証が必要なルートにアクセスしているがユーザーがいない場合、ログインページにリダイレクト
  if (!isPublicRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.LOGIN
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 認証済みのユーザーがログインページにアクセスした場合、ホームにリダイレクト
  if (user && pathname === ROUTES.LOGIN) {
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
