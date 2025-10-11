'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { ENV_KEYS, ROUTES } from '@/lib/constants'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

// 開発環境専用: モックユーザー設定
const DEV_MOCK_USER_CONFIG = {
  id: 'dev-user-mock-id',
  email: 'dev@example.com',
  fullName: 'Dev User',
  avatarUrl: '',
} as const

// 開発環境専用: モックユーザーを作成
function createMockUser(): User | null {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true'
  ) {
    return {
      id: DEV_MOCK_USER_CONFIG.id,
      email: DEV_MOCK_USER_CONFIG.email,
      user_metadata: {
        full_name: DEV_MOCK_USER_CONFIG.fullName,
        avatar_url: DEV_MOCK_USER_CONFIG.avatarUrl,
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User
  }
  return null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 開発環境の認証バイパスチェック
    const mockUser = createMockUser()
    if (mockUser) {
      setUser(mockUser)
      setLoading(false)
      return
    }

    // 初期sessionチェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const redirectUrl =
      process.env.NODE_ENV === 'production'
        ? `${process.env[ENV_KEYS.SITE_URL]}${ROUTES.HOME}`
        : `http://localhost:3000${ROUTES.HOME}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })

    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return { user, loading, signInWithGoogle, signOut }
}
