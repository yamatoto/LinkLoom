'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { ENV_KEYS, ROUTES } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { getDevAuthUser } from '@/app/actions/auth'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    // 開発環境の認証バイパスチェック (Server Action経由)
    getDevAuthUser()
      .then((mockUser) => {
        if (!mounted) return

        if (mockUser) {
          setUser(mockUser)
          setLoading(false)
          return
        }

        // 通常のSupabase認証フロー
        // 初期sessionチェック
        return supabase.auth.getSession()
      })
      .then((result) => {
        if (!result || !mounted) return

        const { data: { session }, error } = result

        if (error) {
          // セッション取得エラー時のログ記録
          if (process.env.NODE_ENV === 'development') {
            logger.error('[useAuth] Session retrieval error:', {
              message: error.message,
              status: error.status,
              name: error.name,
            })
          } else {
            logger.error('[useAuth] Session retrieval error:', error.message)
          }
        }

        setUser(session?.user ?? null)
        setLoading(false)

        // 認証状態の変更を監視
        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
          if (!mounted) return

          // セッション期限切れ時の自動リダイレクト処理
          if (event === 'TOKEN_REFRESHED') {
            if (process.env.NODE_ENV === 'development') {
              logger.info('[useAuth] Token refreshed successfully')
            }
          } else if (event === 'SIGNED_OUT') {
            if (process.env.NODE_ENV === 'development') {
              logger.info('[useAuth] User signed out')
            }
            // ログアウト時はログインページへリダイレクト
            router.push(ROUTES.LOGIN)
          } else if (event === 'USER_UPDATED') {
            if (process.env.NODE_ENV === 'development') {
              logger.info('[useAuth] User data updated')
            }
          }

          setUser(session?.user ?? null)
          setLoading(false)
        })

        subscription = sub
      })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [router])

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
