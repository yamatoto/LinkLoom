import { redirect } from 'next/navigation'
import { searchArticles, getAllTags } from '@/app/actions/articles'
import { ArticleList } from '@/components/articles/ArticleList'
import { SearchFilters } from '@/components/articles/SearchFilters'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { SearchParams } from '@/types/article'

/**
 * 記事一覧ページ
 *
 * Server Componentでデータフェッチ・検索を実行し、記事一覧を表示
 */
export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  // 検索パラメータの解析
  const keyword = typeof params.keyword === 'string' ? params.keyword : undefined
  const tagIdsParam = params.tagIds
  const tagIds =
    typeof tagIdsParam === 'string' ? tagIdsParam.split(',').filter(Boolean) : undefined
  const sortBy = params.sortBy === 'updated_at' ? 'updated_at' : 'created_at'
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc'

  const searchParamsObj: SearchParams = {
    keyword,
    tagIds,
    sortBy,
    sortOrder,
  }

  // 記事検索とタグ一覧を並列取得
  const [articlesResult, tagsResult] = await Promise.all([
    searchArticles(searchParamsObj),
    getAllTags(),
  ])

  // 認証エラーの場合はログインページへリダイレクト
  if (!articlesResult.success && articlesResult.error?.includes('認証エラー')) {
    redirect('/login')
  }

  // その他のエラーの場合はエラーメッセージを表示
  if (!articlesResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-red-400 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">エラーが発生しました</h3>
          <p className="text-sm text-gray-500 mb-4">{articlesResult.error}</p>
          <Button asChild variant="outline">
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    )
  }

  const articles = articlesResult.articles || []
  const tags = tagsResult.success ? tagsResult.tags || [] : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">記事一覧</h1>
        <Button asChild>
          <Link href="/articles/new">記事を登録</Link>
        </Button>
      </div>

      {/* 検索結果件数 */}
      <div className="text-sm text-muted-foreground mb-6">
        {articles.length}件の記事が見つかりました
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 検索・フィルタサイドバー */}
        <aside className="md:col-span-1">
          <SearchFilters tags={tags} />
        </aside>

        {/* 記事一覧メインコンテンツ */}
        <main className="md:col-span-3">
          <ArticleList articles={articles} />
        </main>
      </div>
    </div>
  )
}
