'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/layout/Header'

export function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="text-sm text-gray-600">読み込み中...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="home-navigation" className="flex flex-1 flex-col gap-8">
          <h1 id="home-navigation" className="sr-only">
            LinkLoom メインナビゲーション
          </h1>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user ? (
              <>
                {/* 記事登録 */}
                <Link
                  href="/articles/new"
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                >
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-600">記事登録</h2>
                  <p className="mt-2 text-sm text-gray-600">URLから記事を登録</p>
                  <p className="mt-2 flex items-center text-xs font-medium text-blue-600">
                    <span>今すぐ登録</span>
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </p>
                </Link>

                {/* 記事一覧 */}
                <Link
                  href="/articles"
                  className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                >
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-600">記事一覧</h2>
                  <p className="mt-2 text-sm text-gray-600">保存した記事を一覧表示</p>
                  <p className="mt-2 flex items-center text-xs font-medium text-blue-600">
                    <span>一覧を見る</span>
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </p>
                </Link>

                {/* 記事検索 */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-900">記事検索</h2>
                  <p className="mt-2 text-sm text-gray-600">保存した記事を検索</p>
                  <p className="mt-2 text-xs text-gray-400">Coming soon...</p>
                </div>
              </>
            ) : (
              <>
                {/* 未ログイン時 */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-900">記事登録</h2>
                  <p className="mt-2 text-sm text-gray-600">URLから記事を登録</p>
                  <p className="mt-2 text-xs text-gray-400">ログインが必要です</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-900">記事一覧</h2>
                  <p className="mt-2 text-sm text-gray-600">保存した記事を一覧表示</p>
                  <p className="mt-2 text-xs text-gray-400">ログインが必要です</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-900">記事検索</h2>
                  <p className="mt-2 text-sm text-gray-600">保存した記事を検索</p>
                  <p className="mt-2 text-xs text-gray-400">ログインが必要です</p>
                </div>
              </>
            )}
          </div>

          {!user && (
            <p className="text-sm text-gray-500">
              アカウントをお持ちの場合はログインして機能を利用できます。
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
