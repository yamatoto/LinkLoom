import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'

export default function ArticlesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">記事一覧</h1>
          <Button disabled>記事を登録</Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* 検索・フィルタサイドバー Skeleton */}
          <aside className="md:col-span-1">
            <div className="space-y-6">
              {/* キーワード検索 */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">キーワード検索</h3>
                <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
              </div>

              {/* 並び順 */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">並び順</h3>
                <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
              </div>

              {/* タグフィルタ */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">タグでフィルタ</h3>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* 記事一覧メインコンテンツ Skeleton */}
          <div className="md:col-span-3">
            {/* 検索結果件数 */}
            <div className="mb-6 text-sm text-muted-foreground">
              <span className="inline-block h-5 w-32 animate-pulse rounded bg-gray-200" />
            </div>

            {/* 記事一覧 */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  {/* プラットフォームアイコンと日付 */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                  </div>

                  {/* タイトル */}
                  <div className="mb-2 h-6 w-full animate-pulse rounded bg-gray-300" />

                  {/* 説明 */}
                  <div className="mb-4 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  </div>

                  {/* 編集ボタン */}
                  <div className="mt-auto">
                    <div className="h-9 w-16 animate-pulse rounded-md bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
