import { notFound, redirect } from 'next/navigation'

import { getArticleById, type GetArticleResult } from '@/app/actions/articles'
import { Header } from '@/components/layout/Header'
import { EditArticleForm } from './_components/EditArticleForm'
import type { ArticleFormData } from '@/schemas/article.schema'

interface ArticleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { id } = await params

  const articleResult = await getArticleById(id)

  if (!articleResult.success) {
    return renderError(articleResult, id)
  }

  const { article } = articleResult

  if (!article) {
    notFound()
  }

  const initialValues: ArticleFormData = {
    url: article.url,
    title: article.title,
    description: article.description ?? '',
    tags: article.tags.map((tag) => tag.name),
    platform: article.platform?.slug ?? '',
  }

  const createdAt = formatDate(article.created_at)
  const updatedAt = formatDate(article.updated_at)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">記事を編集</h1>
          <p className="mt-2 text-sm text-gray-600">
            記事内容を更新するか、不要になった場合は削除できます。
          </p>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">{article.title}</h2>
            <div className="text-sm text-gray-500">
              <p>作成日: {createdAt}</p>
              <p>最終更新日: {updatedAt}</p>
              <p className="break-all">URL: {article.url}</p>
            </div>
          </div>

          <EditArticleForm
            articleId={article.id}
            initialValues={initialValues}
            articleTitle={article.title}
          />
        </section>
      </main>
    </div>
  )
}

function renderError(result: GetArticleResult, articleId: string) {
  if (result.error?.includes('認証エラー')) {
    redirect(`/login?redirect=/articles/${articleId}`)
  }

  if (result.error?.includes('記事が見つかりませんでした')) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">エラーが発生しました</h1>
          <p className="mt-4 text-sm text-gray-600">
            {result.error ?? '記事の取得に失敗しました。しばらくしてからもう一度お試しください。'}
          </p>
        </div>
      </main>
    </div>
  )
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return '不明'
  }
  return new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
