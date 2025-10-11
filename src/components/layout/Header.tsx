'use client'

import { useCallback, memo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { UserMetadata } from '@/types/auth'

// Logo部分を分離してメモ化 - 静的コンテンツなので再レンダリング不要
const HeaderLogo = memo(() => (
  <Link href={ROUTES.HOME} className="flex flex-col">
    <h1 className="text-2xl font-bold text-gray-900">LinkLoom</h1>
    <p className="text-sm text-gray-500">技術記事管理システム</p>
  </Link>
))
HeaderLogo.displayName = 'HeaderLogo'

// UserSection部分を分離してメモ化 - userとhandleLogoutが変更された時のみ再レンダリング
interface UserSectionProps {
  user: User | null
  onLogout: () => void
  onLoginClick: () => void
}

const UserSection = memo(({ user, onLogout, onLoginClick }: UserSectionProps) => {
  if (!user) {
    return (
      <Button onClick={onLoginClick} className="bg-blue-600 text-white hover:bg-blue-700">
        ログイン
      </Button>
    )
  }

  // 型安全性を向上させるためにuser_metadataをUserMetadata型にキャスト
  const metadata = user.user_metadata as UserMetadata

  return (
    <>
      {/* User Avatar & Info */}
      <div className="flex items-center gap-3">
        {metadata.avatar_url ? (
          <Image
            src={metadata.avatar_url}
            alt={metadata.full_name || user.email || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-medium text-blue-700">
              {(metadata.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </span>
          </div>
        )}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{metadata.full_name || user.email}</p>
          <p className="text-xs text-gray-500">ログイン中</p>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={onLogout}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        ログアウト
      </Button>
    </>
  )
})
UserSection.displayName = 'UserSection'

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    const { error } = await signOut()
    if (error) {
      // 開発環境では詳細情報をログ出力
      if (process.env.NODE_ENV === 'development') {
        logger.error('[Header] Logout error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
        })
      } else {
        logger.error('[Header] Logout error:', error.message)
      }

      // ユーザーにエラーを通知
      const userMessage =
        process.env.NODE_ENV === 'development'
          ? `ログアウトに失敗しました: ${error.message}`
          : 'ログアウトに失敗しました。もう一度お試しください。'

      toast.error(userMessage)
      return
    }
    router.push(ROUTES.LOGIN)
  }, [signOut, router])

  const handleLoginClick = useCallback(() => {
    router.push(ROUTES.LOGIN)
  }, [router])

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <HeaderLogo />
          <div className="flex items-center gap-4">
            <UserSection user={user} onLogout={handleLogout} onLoginClick={handleLoginClick} />
          </div>
        </div>
      </div>
    </header>
  )
}
