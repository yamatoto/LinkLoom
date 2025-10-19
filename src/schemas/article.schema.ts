import { z } from 'zod'

/**
 * 記事登録フォームのZodバリデーションスキーマ
 */
export const articleSchema = z.object({
  url: z
    .string()
    .min(1, 'URLを入力してください')
    .max(2048, 'URLは2048文字以内で入力してください')
    .url('有効なURLを入力してください')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URLはhttp://またはhttps://で始まる必要があります'
    ),

  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(200, 'タイトルは200文字以内で入力してください')
    .trim(),

  description: z
    .string()
    .max(5000, '説明は5000文字以内で入力してください')
    .trim()
    .optional()
    .or(z.literal('')),

  tags: z
    .array(z.string().trim().min(1))
    .max(10, 'タグは10個まで選択できます')
    .optional()
    .default([]),

  platform: z.string().optional(),
})

export type ArticleFormData = z.infer<typeof articleSchema>
