import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteArticle, getArticleById, updateArticle } from '@/app/actions/articles'
import type { ArticleFormData } from '@/schemas/article.schema'
import { mockUser } from '../../mocks/supabase'

const mockGetUser = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())
const mockRevalidatePath = vi.hoisted(() => vi.fn())
const mockDetectPlatform = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/lib/platform-detector', () => ({
  detectPlatform: mockDetectPlatform,
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  })
  mockDetectPlatform.mockReturnValue('qiita')
})

describe('getArticleById', () => {
  it('認証済みユーザーの既存記事を取得できる', async () => {
    const mockArticle = {
      id: 'article-1',
      user_id: mockUser.id,
      url: 'https://qiita.com/example/items/12345',
      title: 'サンプル記事',
      description: '説明文',
      platform_id: 'platform-1',
      is_bookmarked: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      platform: {
        id: 'platform-1',
        name: 'Qiita',
        slug: 'qiita',
        name_normalized: 'qiita',
        created_at: '2024-01-01T00:00:00Z',
      },
    }

    const mockArticlesSingle = vi.fn().mockResolvedValue({ data: mockArticle, error: null })
    const mockArticlesEqUser = vi.fn().mockReturnValue({ single: mockArticlesSingle })
    const mockArticlesEqId = vi.fn().mockReturnValue({ eq: mockArticlesEqUser })
    const mockArticlesSelect = vi.fn().mockReturnValue({ eq: mockArticlesEqId })

    const mockTagsEqArticle = vi.fn().mockResolvedValue({
      data: [
        {
          tag: {
            id: 'tag-1',
            name: 'React',
            name_normalized: 'react',
            created_at: '2025-01-01T00:00:00Z',
          },
        },
      ],
      error: null,
    })
    const mockArticleTagsSelect = vi.fn().mockReturnValue({ eq: mockTagsEqArticle })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'articles') {
        return { select: mockArticlesSelect }
      }
      if (table === 'article_tags') {
        return { select: mockArticleTagsSelect }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    const result = await getArticleById('article-1')

    expect(result.success).toBe(true)
    expect(result.article?.id).toBe('article-1')
    expect(result.article?.tags).toHaveLength(1)
    expect(result.article?.tags[0]?.name).toBe('React')
    expect(mockArticlesSelect).toHaveBeenCalled()
    expect(mockArticleTagsSelect).toHaveBeenCalled()
  })

  it('記事が存在しない場合はエラーを返す', async () => {
    const mockArticlesSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })
    const mockArticlesEqUser = vi.fn().mockReturnValue({ single: mockArticlesSingle })
    const mockArticlesEqId = vi.fn().mockReturnValue({ eq: mockArticlesEqUser })
    const mockArticlesSelect = vi.fn().mockReturnValue({ eq: mockArticlesEqId })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'articles') {
        return { select: mockArticlesSelect }
      }
      if (table === 'article_tags') {
        return { select: vi.fn() }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    const result = await getArticleById('missing-article')

    expect(result.success).toBe(false)
    expect(result.error).toContain('記事が見つかりませんでした')
  })

  it('タグ取得でエラーが発生した場合、適切なエラーメッセージを返す', async () => {
    const mockArticlesSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'article-1',
        user_id: mockUser.id,
        url: 'https://qiita.com/example/items/12345',
        title: 'サンプル記事',
        description: '説明文',
        platform_id: 'platform-1',
        is_bookmarked: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
        platform: {
          id: 'platform-1',
          name: 'Qiita',
          slug: 'qiita',
          name_normalized: 'qiita',
          created_at: '2024-01-01T00:00:00Z',
        },
      },
      error: null,
    })
    const mockArticlesEqUser = vi.fn().mockReturnValue({ single: mockArticlesSingle })
    const mockArticlesEqId = vi.fn().mockReturnValue({ eq: mockArticlesEqUser })
    const mockArticlesSelect = vi.fn().mockReturnValue({ eq: mockArticlesEqId })

    const mockTagsEqArticle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Tag fetch error' },
    })
    const mockTagsSelect = vi.fn().mockReturnValue({ eq: mockTagsEqArticle })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'articles') {
        return { select: mockArticlesSelect }
      }
      if (table === 'article_tags') {
        return { select: mockTagsSelect }
      }
      return {}
    })

    const result = await getArticleById('article-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('記事タグの取得に失敗しました')
  })

  it('未認証の場合は認証エラーを返す', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const result = await getArticleById('article-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('認証エラー')
  })
})

describe('updateArticle', () => {
  const validData: ArticleFormData = {
    url: 'https://qiita.com/example/items/12345',
    title: '更新後タイトル',
    description: '更新後の説明',
    tags: [],
  }

  it('記事を更新しキャッシュを再検証する', async () => {
    const mockPlatformsSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'platform-1' }, error: null })
    const mockPlatformsEq = vi.fn().mockReturnValue({ single: mockPlatformsSingle })
    const mockPlatformsSelect = vi.fn().mockReturnValue({ eq: mockPlatformsEq })

    const mockUpdateSingle = vi.fn().mockResolvedValue({ data: { id: 'article-1' }, error: null })
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle })
    const mockUpdateEqUser = vi.fn().mockReturnValue({ select: mockUpdateSelect })
    const mockUpdateEqId = vi.fn().mockReturnValue({ eq: mockUpdateEqUser })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEqId })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'platforms') {
        return { select: mockPlatformsSelect }
      }
      if (table === 'articles') {
        return { update: mockUpdate }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    const result = await updateArticle('article-1', validData)

    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockRevalidatePath).toHaveBeenCalledWith('/articles')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/articles/article-1')
  })

  it('対象記事が見つからない場合はエラーを返す', async () => {
    const mockPlatformsSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'platform-1' }, error: null })
    const mockPlatformsEq = vi.fn().mockReturnValue({ single: mockPlatformsSingle })
    const mockPlatformsSelect = vi.fn().mockReturnValue({ eq: mockPlatformsEq })

    const mockUpdateSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle })
    const mockUpdateEqUser = vi.fn().mockReturnValue({ select: mockUpdateSelect })
    const mockUpdateEqId = vi.fn().mockReturnValue({ eq: mockUpdateEqUser })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEqId })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'platforms') {
        return { select: mockPlatformsSelect }
      }
      if (table === 'articles') {
        return { update: mockUpdate }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    const result = await updateArticle('missing-article', validData)

    expect(result.success).toBe(false)
    expect(result.error).toContain('記事が見つかりませんでした')
  })

  it('バリデーションエラー時にユーザー向けメッセージを返す', async () => {
    const invalidData: ArticleFormData = {
      ...validData,
      url: 'invalid-url',
    }

    const result = await updateArticle('article-1', invalidData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('有効なURLを入力してください')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('未認証の場合は認証エラーを返す', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const result = await updateArticle('article-1', validData)

    expect(result.success).toBe(false)
    expect(result.error).toContain('認証エラー')
  })
})

describe('deleteArticle', () => {
  it('記事を削除しキャッシュを再検証する', async () => {
    const mockDeleteSingle = vi.fn().mockResolvedValue({ data: { id: 'article-1' }, error: null })
    const mockDeleteSelect = vi.fn().mockReturnValue({ single: mockDeleteSingle })
    const mockDeleteEqUser = vi.fn().mockReturnValue({ select: mockDeleteSelect })
    const mockDeleteEqId = vi.fn().mockReturnValue({ eq: mockDeleteEqUser })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEqId })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'articles') {
        return { delete: mockDelete }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    const result = await deleteArticle('article-1')

    expect(result.success).toBe(true)
    expect(mockDelete).toHaveBeenCalled()
    expect(mockRevalidatePath).toHaveBeenCalledWith('/articles')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
  })

  it('記事が存在しない場合はエラーを返す', async () => {
    const mockDeleteSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })
    const mockDeleteSelect = vi.fn().mockReturnValue({ single: mockDeleteSingle })
    const mockDeleteEqUser = vi.fn().mockReturnValue({ select: mockDeleteSelect })
    const mockDeleteEqId = vi.fn().mockReturnValue({ eq: mockDeleteEqUser })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEqId })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'articles') {
        return { delete: mockDelete }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    const result = await deleteArticle('missing-article')

    expect(result.success).toBe(false)
    expect(result.error).toContain('記事が見つかりませんでした')
  })

  it('未認証の場合は認証エラーを返す', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })

    const result = await deleteArticle('article-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('認証エラー')
  })
})
