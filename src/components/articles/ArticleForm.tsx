'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { articleSchema, type ArticleFormData } from '@/schemas/article.schema'
import {
  detectPlatform,
  PLATFORM_DISPLAY_NAMES,
  type PlatformSlug,
} from '@/lib/platform-detector'
import { useMemo } from 'react'

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => Promise<void>
  isSubmitting?: boolean
}

export function ArticleForm({ onSubmit, isSubmitting = false }: ArticleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      url: '',
      title: '',
      description: '',
      tags: [],
      platform: '',
    },
  })

  const urlValue = watch('url')

  // URLが変更されたら自動的にプラットフォームを判定（useMemoで最適化）
  const detectedPlatform = useMemo<PlatformSlug>(() => {
    if (urlValue) {
      return detectPlatform(urlValue)
    }
    return 'unknown'
  }, [urlValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* URL入力 */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          記事URL <span className="text-red-500">*</span>
        </label>
        <input
          {...register('url')}
          id="url"
          type="text"
          placeholder="https://zenn.dev/..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>}

        {/* プラットフォーム自動判定の表示 */}
        {urlValue && detectedPlatform !== 'unknown' && (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-blue-50 p-2 text-sm text-blue-700">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              プラットフォーム: <strong>{PLATFORM_DISPLAY_NAMES[detectedPlatform]}</strong>
            </span>
          </div>
        )}
      </div>

      {/* タイトル入力 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          記事タイトル <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          id="title"
          type="text"
          placeholder="React Hooksの基本"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      {/* 説明入力 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          説明（任意）
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={4}
          placeholder="React Hooksの使い方について解説した記事です"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* タグ入力（将来実装予定） */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          タグ（任意、カンマ区切り）
        </label>
        <input
          id="tags"
          type="text"
          placeholder="React, TypeScript, Hooks"
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
          disabled
        />
        <p className="mt-1 text-xs text-gray-500">※ タグ機能は現在開発中です</p>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              保存中...
            </>
          ) : (
            '記事を保存'
          )}
        </button>
      </div>
    </form>
  )
}
