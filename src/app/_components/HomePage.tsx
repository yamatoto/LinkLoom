'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { logger } from '@/lib/logger'

export function HomePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      logger.error('[HomePage] Logout error:', error)
      return
    }
    router.push(ROUTES.LOGIN)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LinkLoom</h1>
              <p className="text-sm text-gray-500">技術記事管理システム</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">ログイン中</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">ログイン成功！</h2>
            <p className="mt-4 text-lg text-gray-600">
              Google OAuth認証が正常に完了しました
            </p>
            <div className="mt-6 rounded-md bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>認証済みユーザー:</strong> {user.email}
              </p>
              <p className="mt-2 text-xs text-blue-600">
                セッションID: {user.id.substring(0, 8)}...
              </p>
            </div>
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                これから記事管理機能の実装を進めていきます
              </p>
            </div>
          </div>
        </div>

        {/* Future Features Preview */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">記事登録</h3>
            <p className="mt-2 text-sm text-gray-600">URLから記事を登録</p>
            <p className="mt-2 text-xs text-gray-400">Coming soon...</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">記事検索</h3>
            <p className="mt-2 text-sm text-gray-600">保存した記事を検索</p>
            <p className="mt-2 text-xs text-gray-400">Coming soon...</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">記事一覧</h3>
            <p className="mt-2 text-sm text-gray-600">記事を一覧表示</p>
            <p className="mt-2 text-xs text-gray-400">Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  )
}
