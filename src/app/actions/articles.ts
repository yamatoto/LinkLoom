'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { articleSchema, type ArticleFormData } from '@/schemas/article.schema'
import { ZodError } from 'zod'
import { detectPlatform } from '@/lib/platform-detector'
import type { ArticleWithPlatform, SearchParams, Tag } from '@/types/article'

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

export interface GetAllTagsResult {
  success: boolean
  error?: string
  tags?: Tag[]
}

export interface GetArticleResult {
  success: boolean
  error?: string
  article?: ArticleWithPlatform
}

export interface UpdateArticleResult {
  success: boolean
  error?: string
}

export interface DeleteArticleResult {
  success: boolean
  error?: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ARTICLE_SELECT_FIELDS = `
  *,
  platform:platforms(*)
`

interface NormalizedSearchParams {
  keyword: string | null
  tagIds: string[]
  sortBy: 'created_at' | 'updated_at'
  sortOrder: 'asc' | 'desc'
  requiresEmptyResult: boolean
}

const DEFAULT_NORMALIZED_PARAMS: NormalizedSearchParams = {
  keyword: null,
  tagIds: [],
  sortBy: 'created_at',
  sortOrder: 'desc',
  requiresEmptyResult: false,
}

function normalizeSearchParams(searchParams: SearchParams): NormalizedSearchParams {
  const keyword =
    typeof searchParams.keyword === 'string' && searchParams.keyword.trim().length > 0
      ? searchParams.keyword.trim()
      : null

  const rawTagIds = Array.isArray(searchParams.tagIds) ? searchParams.tagIds : []
  const validTagIds = Array.from(new Set(rawTagIds.filter((id) => UUID_REGEX.test(id)))).sort()

  return {
    keyword,
    tagIds: validTagIds,
    sortBy: searchParams.sortBy === 'updated_at' ? 'updated_at' : 'created_at',
    sortOrder: searchParams.sortOrder === 'asc' ? 'asc' : 'desc',
    requiresEmptyResult: rawTagIds.length > 0 && validTagIds.length === 0,
  }
}

function escapeForILike(value: string): string {
  return value.replace(/([%_\\])/g, '\\$1')
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

const fetchArticlesForUser = async (
  supabase: SupabaseClient,
  userId: string,
  params: NormalizedSearchParams
): Promise<ArticleWithPlatform[]> => {
  if (params.requiresEmptyResult) {
    return []
  }

  let query = supabase
    .from('articles')
    .select(ARTICLE_SELECT_FIELDS)
    .eq('user_id', userId)

  if (params.keyword) {
    const escapedKeyword = escapeForILike(params.keyword)
    query = query.or(`title.ilike.%${escapedKeyword}%,description.ilike.%${escapedKeyword}%`)
  }

  if (params.tagIds.length > 0) {
    const { data: filteredArticleIds, error: tagFilterError } = await supabase
      .from('article_tags')
      .select('article_id')
      .in('tag_id', params.tagIds)

    if (tagFilterError) {
      throw tagFilterError
    }

    if (!filteredArticleIds || filteredArticleIds.length === 0) {
      return []
    }

    const articleIdCounts = new Map<string, number>()
    filteredArticleIds.forEach((row) => {
      articleIdCounts.set(row.article_id, (articleIdCounts.get(row.article_id) || 0) + 1)
    })

    const matchedArticleIds = Array.from(articleIdCounts.entries())
      .filter(([, count]) => count === params.tagIds.length)
      .map(([articleId]) => articleId)

    if (matchedArticleIds.length === 0) {
      return []
    }

    query = query.in('id', matchedArticleIds)
  }

  query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' })

  const { data: articles, error: fetchError } = await query

  if (fetchError) {
    throw fetchError
  }

  if (!articles || articles.length === 0) {
    return []
  }

  const articleIds = articles.map((article) => article.id)

  const { data: allArticleTags, error: tagsError } = await supabase
    .from('article_tags')
    .select(
      `
        article_id,
        tag:tags(*)
      `
    )
    .in('article_id', articleIds)

  if (tagsError) {
    throw tagsError
  }

  const tagsByArticleId = new Map<string, Tag[]>()
  allArticleTags?.forEach((relation) => {
    if (!tagsByArticleId.has(relation.article_id)) {
      tagsByArticleId.set(relation.article_id, [])
    }
    if (relation.tag) {
      tagsByArticleId.get(relation.article_id)!.push(relation.tag)
    }
  })

  return articles.map<ArticleWithPlatform>((article) => ({
    ...article,
    platform: article.platform || null,
    tags: tagsByArticleId.get(article.id) || [],
  }))
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
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? '入力内容に誤りがあります。'
      return {
        success: false,
        error: message,
      }
    }
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

    try {
      const articles = await fetchArticlesForUser(supabase, user.id, DEFAULT_NORMALIZED_PARAMS)
      return {
        success: true,
        articles,
      }
    } catch (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('記事取得エラー:', fetchError)
      }
      return {
        success: false,
        error: '記事の取得に失敗しました。しばらくしてからもう一度お試しください。',
      }
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

/**
 * 記事詳細を取得するServer Action
 *
 * @param articleId - 記事ID
 * @returns 記事詳細データ
 */
export async function getArticleById(articleId: string): Promise<GetArticleResult> {
  try {
    const supabase = await createClient()

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

    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select(
        `
        *,
        platform:platforms(*)
      `
      )
      .eq('id', articleId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !article) {
      if (process.env.NODE_ENV === 'development' && fetchError && fetchError.code !== 'PGRST116') {
        console.error('記事詳細取得エラー:', fetchError)
      }
      return {
        success: false,
        error: '記事が見つかりませんでした。削除済みの可能性があります。',
      }
    }

    const { data: articleTags, error: tagsError } = await supabase
      .from('article_tags')
      .select(
        `
        tag:tags(*)
      `
      )
      .eq('article_id', articleId)

    if (tagsError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('記事タグ取得エラー:', tagsError)
      }
      return {
        success: false,
        error: '記事タグの取得に失敗しました。しばらくしてからもう一度お試しください。',
      }
    }

    const tags = (articleTags || [])
      .map((record) => record.tag)
      .filter((tag): tag is Tag => Boolean(tag))

    return {
      success: true,
      article: {
        ...article,
        tags,
      },
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

/**
 * 記事を更新するServer Action
 *
 * @param articleId - 記事ID
 * @param data - 更新データ
 * @returns 更新結果
 */
export async function updateArticle(
  articleId: string,
  data: ArticleFormData
): Promise<UpdateArticleResult> {
  try {
    const validatedData = articleSchema.parse(data)

    const supabase = await createClient()

    const platformSlug = detectPlatform(validatedData.url)

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

    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update({
        url: validatedData.url,
        title: validatedData.title,
        description: validatedData.description || null,
        platform_id: platformId,
      })
      .eq('id', articleId)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (updateError || !updatedArticle) {
      if (process.env.NODE_ENV === 'development') {
        console.error('記事更新エラー:', updateError)
      }
      return {
        success: false,
        error:
          updateError && updateError.code === 'PGRST116'
            ? '記事が見つかりませんでした。削除済みの可能性があります。'
            : '記事の更新に失敗しました。しばらくしてからもう一度お試しください。',
      }
    }

    revalidatePath('/articles')
    revalidatePath('/')
    revalidatePath(`/articles/${articleId}`)

    return {
      success: true,
    }
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? '入力内容に誤りがあります。'
      return {
        success: false,
        error: message,
      }
    }
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
 * 記事を削除するServer Action
 *
 * @param articleId - 記事ID
 * @returns 削除結果
 */
export async function deleteArticle(articleId: string): Promise<DeleteArticleResult> {
  try {
    const supabase = await createClient()

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

    const { data: deletedArticle, error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (deleteError || !deletedArticle) {
      if (process.env.NODE_ENV === 'development') {
        console.error('記事削除エラー:', deleteError)
      }
      return {
        success: false,
        error:
          deleteError && deleteError.code === 'PGRST116'
            ? '記事が見つかりませんでした。削除済みの可能性があります。'
            : '記事の削除に失敗しました。しばらくしてからもう一度お試しください。',
      }
    }

    revalidatePath('/articles')
    revalidatePath('/')

    return {
      success: true,
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

/**
 * 全タグを取得するServer Action
 *
 * @returns タグ一覧データ
 */
export async function getAllTags(): Promise<GetAllTagsResult> {
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

    const { data: tags, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .order('name_normalized', { ascending: true })

    if (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('タグ取得エラー:', fetchError)
      }
      return {
        success: false,
        error: 'タグの取得に失敗しました。しばらくしてからもう一度お試しください。',
      }
    }

    return {
      success: true,
      tags: tags || [],
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

/**
 * 記事を検索・フィルタリングするServer Action
 *
 * @param searchParams - 検索パラメータ
 * @returns 検索結果の記事一覧データ
 */
export async function searchArticles(searchParams: SearchParams = {}): Promise<GetArticlesResult> {
  try {
    const normalizedParams = normalizeSearchParams(searchParams)

    if (normalizedParams.requiresEmptyResult) {
      return {
        success: true,
        articles: [],
      }
    }

    const supabase = await createClient()

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

    try {
      const articles = await fetchArticlesForUser(supabase, user.id, normalizedParams)
      return {
        success: true,
        articles,
      }
    } catch (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('記事検索エラー:', fetchError)
      }
      return {
        success: false,
        error: '記事の検索に失敗しました。しばらくしてからもう一度お試しください。',
      }
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
