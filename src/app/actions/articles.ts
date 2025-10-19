'use server'

import { createClient } from '@/lib/supabase/server'
import { articleSchema, type ArticleFormData } from '@/schemas/article.schema'
import { detectPlatform } from '@/lib/platform-detector'
import { revalidatePath } from 'next/cache'
import type { ArticleWithPlatform, Tag } from '@/types/article'

export interface CreateArticleResult {
  success: boolean
  error?: string
  articleId?: string
}

export interface GetArticlesResult {
  success: boolean
  error?: string
  articles?: ArticleWithPlatform[]
}

/**
 * 記事を新規登録するServer Action
 *
 * @param data - 記事フォームデータ
 * @returns 登録結果
 */
export async function createArticle(data: ArticleFormData): Promise<CreateArticleResult> {
  try {
    // バリデーション
    const validatedData = articleSchema.parse(data)

    // Supabaseクライアント作成
    const supabase = await createClient()

    // プラットフォームの判定
    const platformSlug = detectPlatform(validatedData.url)

    // 認証チェックとプラットフォームID取得を並列実行（パフォーマンス最適化）
    const [authResult, platformResult] = await Promise.all([
      supabase.auth.getUser(),
      platformSlug !== 'unknown'
        ? supabase.from('platforms').select('id').eq('slug', platformSlug).single()
        : Promise.resolve({ data: null, error: null }),
    ])

    const {
      data: { user },
      error: authError,
    } = authResult

    if (authError || !user) {
      return {
        success: false,
        error: '認証エラー: ログインしてください',
      }
    }

    const platformId = platformResult.data?.id ?? null

    // 記事データの挿入
    const insertData = {
      user_id: user.id,
      url: validatedData.url,
      title: validatedData.title,
      description: validatedData.description || null,
      platform_id: platformId,
      is_bookmarked: false,
    }

    const { data: articleData, error: insertError } = await supabase
      .from('articles')
      .insert(insertData)
      .select('id')
      .single()

    if (insertError) {
      // ログは本番環境で機密情報を出力しないように注意
      if (process.env.NODE_ENV === 'development') {
        console.error('記事登録エラー:', insertError)
      }
      return {
        success: false,
        error: '記事の登録に失敗しました。しばらくしてからもう一度お試しください。',
      }
    }

    // TODO: タグの登録処理（将来実装）
    // if (validatedData.tags && validatedData.tags.length > 0) {
    //   await createArticleTags(articleData.id, validatedData.tags)
    // }

    // キャッシュを再検証
    revalidatePath('/articles')
    revalidatePath('/')

    return {
      success: true,
      articleId: articleData.id,
    }
  } catch (error) {
    // ログは本番環境で機密情報を出力しないように注意
    if (process.env.NODE_ENV !== 'production') {
      console.error('予期しないエラー:', error)
    }
    return {
      success: false,
      error: '予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
    }
  }
}

/**
 * 記事一覧を取得するServer Action
 *
 * @returns 記事一覧データ
 */
export async function getArticles(): Promise<GetArticlesResult> {
  try {
    // Supabaseクライアント作成
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: '認証エラー: ログインしてください',
      }
    }

    // 記事一覧を取得（プラットフォーム情報を含む）
    // RLSにより認証ユーザーの記事のみ取得される
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select(
        `
        *,
        platform:platforms(*)
      `
      )
      .order('created_at', { ascending: false })

    if (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('記事取得エラー:', fetchError)
      }
      return {
        success: false,
        error: '記事の取得に失敗しました。しばらくしてからもう一度お試しください。',
      }
    }

    // タグ情報を1クエリで取得（N+1問題の回避）
    const articleIds = (articles || []).map((a) => a.id)

    // 全記事のタグを一括取得
    const { data: allArticleTags } = await supabase
      .from('article_tags')
      .select(
        `
        article_id,
        tag:tags(*)
      `
      )
      .in('article_id', articleIds)

    // article_id ごとにタグをグループ化（メモリ内で処理）
    const tagsByArticleId = new Map<string, Tag[]>()
    allArticleTags?.forEach((at) => {
      if (!tagsByArticleId.has(at.article_id)) {
        tagsByArticleId.set(at.article_id, [])
      }
      if (at.tag) {
        tagsByArticleId.get(at.article_id)!.push(at.tag)
      }
    })

    // 記事とタグを結合（DBクエリなし）
    const articlesWithTags: ArticleWithPlatform[] = (articles || []).map((article) => ({
      ...article,
      platform: article.platform || null,
      tags: tagsByArticleId.get(article.id) || [],
    }))

    return {
      success: true,
      articles: articlesWithTags,
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('予期しないエラー:', error)
    }
    return {
      success: false,
      error: '予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
    }
  }
}
