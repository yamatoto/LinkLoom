'use server'

import type { User } from '@supabase/supabase-js'
import type { UserMetadata } from '@/types/auth'

/**
 * 開発環境専用: モックユーザーを取得
 *
 * Server Actionとしてサーバーサイドで実行されるため、
 * 環境変数がクライアントサイドに公開されるリスクがゼロ
 *
 * 利点:
 * - NEXT_PUBLIC_プレフィックス不要 (クライアントサイドに公開されない)
 * - サーバーサイドで完全に制御
 * - 本番ビルドに含まれるリスクゼロ
 */
export async function getDevAuthUser(): Promise<User | null> {
  // 開発環境かつDEV_AUTH_BYPASSがtrueの場合のみモックユーザーを返す
  if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true') {
    const metadata: UserMetadata = {
      full_name: 'Dev User',
      avatar_url: '',
    }

    return {
      id: 'dev-user-mock-id',
      email: 'dev@example.com',
      user_metadata: metadata,
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User
  }

  return null
}
