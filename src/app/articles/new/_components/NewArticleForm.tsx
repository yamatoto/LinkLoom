'use client'

import { ArticleForm } from '@/components/articles/ArticleForm'
import { createArticle } from '@/app/actions/articles'
import type { ArticleFormData } from '@/schemas/article.schema'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

/**
 * 記事登録フォームコンポーネント（クライアントコンポーネント）
 *
 * フォーム送信処理とローディング状態を管理する。
 * サーバーコンポーネントの親から分離することで、
 * インタラクティブな動作とサーバーサイド認証を両立。
 */
export function NewArticleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true)

    try {
      const result = await createArticle(data)

      if (!result.success) {
        toast.error(result.error || '記事の保存に失敗しました')
        setIsSubmitting(false)
        return
      }

      toast.success('記事を保存しました')
      router.push('/articles')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('送信エラー:', error)
      }
      toast.error('予期しないエラーが発生しました')
      setIsSubmitting(false)
    }
  }

  return <ArticleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
