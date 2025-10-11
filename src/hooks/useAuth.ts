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
  const [isDevMode, setIsDevMode] = useState(false)
  const router = useRouter()

  // useEffect 1: 開発環境認証バイパスチェック
  useEffect(() => {
    let mounted = true

    async function checkDevAuth() {
      const mockUser = await getDevAuthUser()

      if (!mounted) return

      if (mockUser) {
        setUser(mockUser)
        setLoading(false)
        setIsDevMode(true)
      } else {
        setIsDevMode(false)
      }
    }

    checkDevAuth()

    return () => {
      mounted = false
    }
  }, [])

  // useEffect 2: Supabase初期セッション取得（開発モード時はスキップ）
  useEffect(() => {
    if (isDevMode) return

    let mounted = true

    async function initSession() {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (!mounted) return

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
    }

    initSession()

    return () => {
      mounted = false
    }
  }, [isDevMode])

  // useEffect 3: 認証状態変更の監視（開発モード時はスキップ）
  useEffect(() => {
    if (isDevMode) return

    let mounted = true

    const {
      data: { subscription },
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

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isDevMode, router])

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
