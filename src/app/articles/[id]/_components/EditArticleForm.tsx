'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { ArticleForm } from '@/components/articles/ArticleForm'
import type { ArticleFormData } from '@/schemas/article.schema'
import { deleteArticle, updateArticle } from '@/app/actions/articles'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface EditArticleFormProps {
  articleId: string
  initialValues: ArticleFormData
  articleTitle: string
}

export function EditArticleForm({
  articleId,
  initialValues,
  articleTitle,
}: EditArticleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateArticle(articleId, data)

      if (!result.success) {
        toast.error(result.error ?? '記事の更新に失敗しました')
        return
      }

      toast.success('記事を更新しました')
      router.refresh()
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('記事更新処理で予期しないエラー:', error)
      }
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteArticle(articleId)

      if (!result.success) {
        toast.error(result.error ?? '記事の削除に失敗しました')
        return
      }

      toast.success('記事を削除しました')
      router.push('/articles')
      router.refresh()
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('記事削除処理で予期しないエラー:', error)
      }
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <ArticleForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="記事を更新"
        submittingLabel="更新中..."
        initialValues={initialValues}
      />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            disabled={isSubmitting || isDeleting}
          >
            {isDeleting ? '削除中...' : '記事を削除'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この記事を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{articleTitle}」を削除すると元に戻せません。この記事に紐づくタグ情報も削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
