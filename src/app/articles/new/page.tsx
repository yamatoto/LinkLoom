'use client'

import { ArticleForm } from '@/components/articles/ArticleForm'
import { Header } from '@/components/layout/Header'
import { createArticle } from '@/app/actions/articles'
import type { ArticleFormData } from '@/schemas/article.schema'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewArticlePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true)

    try {
      const result = await createArticle(data)

      if (result.success) {
        toast.success('記事を保存しました')
        router.push('/') // TODO: 実装が完了したらrouter.push('/articles')
      } else {
        toast.error(result.error || '記事の保存に失敗しました')
      }
    } catch (error) {
      // ログは本番環境で機密情報を出力しないように注意
      if (process.env.NODE_ENV !== 'production') {
        console.error('送信エラー:', error)
      }
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新しい記事を登録</h1>
          <p className="mt-2 text-sm text-gray-600">
            URLと記事情報を入力して、記事を保存しましょう
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <ArticleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </main>
    </div>
  )
}
