import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 認証成功：指定されたパスにリダイレクト
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // エラー：ログインページにリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
