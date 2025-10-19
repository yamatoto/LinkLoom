import { redirect } from 'next/navigation'
import { getArticles } from '@/app/actions/articles'
import { ArticleList } from '@/components/articles/ArticleList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * 記事一覧ページ
 *
 * Server Componentでデータフェッチし、記事一覧を表示
 */
export default async function ArticlesPage() {
  const result = await getArticles()

  // 認証エラーの場合はログインページへリダイレクト
  if (!result.success && result.error?.includes('認証エラー')) {
    redirect('/login')
  }

  // その他のエラーの場合はエラーメッセージを表示
  if (!result.success) {
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
          <p className="text-sm text-gray-500 mb-4">{result.error}</p>
          <Button asChild variant="outline">
            <Link href="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    )
  }

  const articles = result.articles || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">記事一覧</h1>
          <p className="text-sm text-gray-500 mt-2">
            {articles.length > 0
              ? `${articles.length}件の記事が見つかりました`
              : '記事を登録してください'}
          </p>
        </div>
        <Button asChild>
          <Link href="/articles/new">記事を登録</Link>
        </Button>
      </div>

      <ArticleList articles={articles} />
    </div>
  )
}
