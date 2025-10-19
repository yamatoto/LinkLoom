import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Server ComponentsとServer Actions用のSupabaseクライアントを作成
 *
 * @returns Supabaseクライアント
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Componentsではcookieの設定ができない場合がある
            // （例: renderingフェーズ中）
            // その場合は静かに失敗させる
            // middlewareがセッションをリフレッシュするので問題ない
          }
        },
      },
    }
  )
}
