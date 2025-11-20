import { redirect } from 'next/navigation'
import { searchArticles } from '@/app/actions/articles'
import { ArticleList } from '@/components/articles/ArticleList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { SearchParams } from '@/types/article'

interface ArticlesContentProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

/**
 * 記事一覧コンテンツ
 * 記事一覧のみを表示（検索結果件数 + 記事カード）
 */
export async function ArticlesContent({ searchParams }: ArticlesContentProps) {
  // 検索パラメータの解析
  const keyword = typeof searchParams.keyword === 'string' ? searchParams.keyword : undefined
  const tagIdsParam = searchParams.tagIds
  const tagIds =
    typeof tagIdsParam === 'string' ? tagIdsParam.split(',').filter(Boolean) : undefined
  const sortBy = searchParams.sortBy === 'updated_at' ? 'updated_at' : 'created_at'
  const sortOrder = searchParams.sortOrder === 'asc' ? 'asc' : 'desc'

  const searchParamsObj: SearchParams = {
    keyword,
    tagIds,
    sortBy,
    sortOrder,
  }

  // 記事検索
  const articlesResult = await searchArticles(searchParamsObj)

  // 認証エラーの場合はログインページへリダイレクト
  if (!articlesResult.success && articlesResult.error?.includes('認証エラー')) {
    redirect('/login')
  }

  // その他のエラーの場合はエラーメッセージを表示
  if (!articlesResult.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="mb-4 h-16 w-16 text-red-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">エラーが発生しました</h3>
        <p className="mb-4 text-sm text-gray-500">{articlesResult.error}</p>
        <Button asChild variant="outline">
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    )
  }

  const articles = articlesResult.articles || []

  return (
    <>
      {/* 検索結果件数 */}
      <div className="mb-6 text-sm text-muted-foreground">
        {articles.length}件の記事が見つかりました
      </div>

      {/* 記事一覧 */}
      <ArticleList articles={articles} />
    </>
  )
}
