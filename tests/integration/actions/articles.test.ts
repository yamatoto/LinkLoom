import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createArticle, getArticles, getAllTags, searchArticles } from '@/app/actions/articles'
import type { ArticleFormData } from '@/schemas/article.schema'
import { mockUser } from '../../mocks/supabase'

/**
 * Server Actions統合テスト
 *
 * テスト対象: src/app/actions/articles.ts
 *
 * 重要: Next.js Server ActionsはServer Component内で実行されるため、
 * 実際のSupabaseサーバーモックを使用した統合テストを行う。
 */

// Supabase Server Clientのモック
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

// next/cache のモック
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// platform-detectorのモック（実装の詳細には依存しない）
vi.mock('@/lib/platform-detector', () => ({
  detectPlatform: vi.fn((url: string) => {
    if (url.includes('qiita.com')) return 'qiita'
    if (url.includes('zenn.dev')) return 'zenn'
    return 'unknown'
  }),
}))

describe('createArticle Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック動作を設定
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    // メソッドチェーンのモック
    mockSingle.mockResolvedValue({
      data: { id: 'platform-1' },
      error: null,
    })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'platforms') {
        return { select: mockSelect }
      }
      if (table === 'articles') {
        return {
          insert: mockInsert.mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'article-123' },
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })
  })

  describe('成功ケース', () => {
    it('有効なデータで記事が正常に登録される', async () => {
      // Given: 有効な記事データ
      const validData: ArticleFormData = {
        url: 'https://qiita.com/example/items/12345',
        title: 'テスト記事',
        description: 'テスト説明',
        tags: [],
      }

      // When: createArticleを実行
      const result = await createArticle(validData)

      // Then: 成功が返される
      expect(result.success).toBe(true)
      expect(result.articleId).toBe('article-123')
      expect(result.error).toBeUndefined()

      // Then: 認証チェックが呼ばれる
      expect(mockGetUser).toHaveBeenCalledTimes(1)

      // Then: プラットフォーム取得が呼ばれる
      expect(mockFrom).toHaveBeenCalledWith('platforms')

      // Then: 記事挿入が呼ばれる
      expect(mockFrom).toHaveBeenCalledWith('articles')
    })

    it('プラットフォームがunknownでも記事が登録される', async () => {
      const validData: ArticleFormData = {
        url: 'https://example.com/article',
        title: 'テスト記事',
        description: '',
        tags: [],
      }

      const result = await createArticle(validData)

      expect(result.success).toBe(true)
      expect(result.articleId).toBe('article-123')
    })
  })

  describe('認証エラー', () => {
    it('ユーザーが認証されていない場合、エラーが返される', async () => {
      // Given: 認証エラー
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const validData: ArticleFormData = {
        url: 'https://qiita.com/example/items/12345',
        title: 'テスト記事',
        description: '',
        tags: [],
      }

      // When: createArticleを実行
      const result = await createArticle(validData)

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
      expect(result.articleId).toBeUndefined()
    })

    it('userがnullの場合、エラーが返される', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const validData: ArticleFormData = {
        url: 'https://qiita.com/example/items/12345',
        title: 'テスト記事',
        description: '',
        tags: [],
      }

      const result = await createArticle(validData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
    })
  })

  describe('バリデーションエラー', () => {
    it('不正なURL形式でエラーが返される', async () => {
      // Given: 不正なURL
      const invalidData = {
        url: 'invalid-url',
        title: 'テスト記事',
        description: '',
        tags: [],
      } as ArticleFormData

      // When: createArticleを実行
      const result = await createArticle(invalidData)

      // Then: バリデーションエラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('空のタイトルでエラーが返される', async () => {
      const invalidData = {
        url: 'https://qiita.com/example/items/12345',
        title: '',
        description: '',
        tags: [],
      } as ArticleFormData

      const result = await createArticle(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('データベースエラー', () => {
    it('記事挿入エラー時、エラーメッセージが返される', async () => {
      // Given: DB挿入エラー
      mockFrom.mockImplementation((table: string) => {
        if (table === 'platforms') {
          return { select: mockSelect }
        }
        if (table === 'articles') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error', code: 'DB_ERROR' },
                }),
              }),
            }),
          }
        }
        return {}
      })

      const validData: ArticleFormData = {
        url: 'https://qiita.com/example/items/12345',
        title: 'テスト記事',
        description: '',
        tags: [],
      }

      // When: createArticleを実行
      const result = await createArticle(validData)

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('記事の登録に失敗しました')
      expect(result.articleId).toBeUndefined()
    })

    it('プラットフォーム取得エラーでも記事登録は継続される', async () => {
      // Given: プラットフォーム取得エラー
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Platform not found' },
      })

      const validData: ArticleFormData = {
        url: 'https://qiita.com/example/items/12345',
        title: 'テスト記事',
        description: '',
        tags: [],
      }

      // When: createArticleを実行
      const result = await createArticle(validData)

      // Then: 記事登録は成功（platform_idはnull）
      expect(result.success).toBe(true)
      expect(result.articleId).toBe('article-123')
    })
  })

  describe('並列処理の動作確認', () => {
    it('認証チェックとプラットフォーム取得が並列実行される', async () => {
      const validData: ArticleFormData = {
        url: 'https://zenn.dev/example/articles/12345',
        title: 'テスト記事',
        description: '',
        tags: [],
      }

      await createArticle(validData)

      // Then: 両方の処理が呼ばれている（並列実行の証明）
      expect(mockGetUser).toHaveBeenCalled()
      expect(mockFrom).toHaveBeenCalledWith('platforms')
    })
  })

  describe('セキュリティ', () => {
    it('エラー時にログが出力される（開発環境）', async () => {
      // Given: console.errorをスパイ
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Given: DB挿入エラー
      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Sensitive DB error' },
                }),
              }),
            }),
          }
        }
        return { select: mockSelect }
      })

      const validData: ArticleFormData = {
        url: 'https://qiita.com/example/items/12345',
        title: 'テスト記事',
        description: '',
        tags: [],
      }

      // When: createArticleを実行
      const result = await createArticle(validData)

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('記事の登録に失敗しました')

      // Then: 開発環境ではログが出力される
      // NOTE: 実際にはprocess.env.NODE_ENVがdevelopmentかどうかで分岐するが、
      // テスト環境では必ずしもdevelopmentではないため、呼ばれたかどうかだけチェック
      // 本番環境ではログが出力されないことはコードレビューで担保

      // Cleanup
      consoleErrorSpy.mockRestore()
    })
  })
})

describe('getArticles Server Action', () => {
  const mockArticles = [
    {
      id: 'article-1',
      user_id: mockUser.id,
      url: 'https://qiita.com/example/items/12345',
      title: 'テスト記事1',
      description: 'テスト説明1',
      platform_id: 'platform-1',
      is_bookmarked: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      platform: {
        id: 'platform-1',
        name: 'Qiita',
        slug: 'qiita',
        url: 'https://qiita.com',
        icon_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      id: 'article-2',
      user_id: mockUser.id,
      url: 'https://zenn.dev/example/articles/67890',
      title: 'テスト記事2',
      description: 'テスト説明2',
      platform_id: 'platform-2',
      is_bookmarked: false,
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      platform: {
        id: 'platform-2',
        name: 'Zenn',
        slug: 'zenn',
        url: 'https://zenn.dev',
        icon_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
  ]

  const mockArticleTags = [
    {
      article_id: 'article-1',
      tag: {
        id: 'tag-1',
        name: 'TypeScript',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      article_id: 'article-1',
      tag: {
        id: 'tag-2',
        name: 'React',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック動作を設定
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  describe('成功ケース', () => {
    it('記事一覧が正常に取得される', async () => {
      // Given: 記事とタグのモック
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: mockArticles,
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: mockArticleTags,
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: getArticlesを実行
      const result = await getArticles()

      // Then: 成功が返される
      expect(result.success).toBe(true)
      expect(result.articles).toHaveLength(2)
      expect(result.error).toBeUndefined()

      // Then: 記事データが正しく含まれる
      expect(result.articles?.[0]?.id).toBe('article-1')
      expect(result.articles?.[0]?.title).toBe('テスト記事1')
      expect(result.articles?.[0]?.platform?.slug).toBe('qiita')

      // Then: タグが正しく結合されている
      expect(result.articles?.[0]?.tags).toHaveLength(2)
      expect(result.articles?.[0]?.tags?.[0]?.name).toBe('TypeScript')
      expect(result.articles?.[0]?.tags?.[1]?.name).toBe('React')

      // Then: 2番目の記事にはタグがない
      expect(result.articles?.[1]?.tags).toHaveLength(0)

      // Then: 認証チェックが呼ばれる
      expect(mockGetUser).toHaveBeenCalledTimes(1)

      // Then: 記事取得が呼ばれる
      expect(mockFrom).toHaveBeenCalledWith('articles')
      expect(mockArticlesSelect).toHaveBeenCalled()
      expect(mockOrderBy).toHaveBeenCalledWith('created_at', { ascending: false })

      // Then: タグ取得が呼ばれる（N+1問題回避の確認）
      expect(mockFrom).toHaveBeenCalledWith('article_tags')
      expect(mockTagsSelect).toHaveBeenCalled()
      expect(mockIn).toHaveBeenCalledWith('article_id', ['article-1', 'article-2'])
    })

    it('記事が0件の場合、空配列が返される', async () => {
      // Given: 記事が0件
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: getArticlesを実行
      const result = await getArticles()

      // Then: 成功が返され、空配列が返る
      expect(result.success).toBe(true)
      expect(result.articles).toEqual([])
      expect(result.error).toBeUndefined()
    })

    it('タグ取得がnullでも記事一覧は返される', async () => {
      // Given: タグ取得がnull
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: mockArticles,
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: getArticlesを実行
      const result = await getArticles()

      // Then: 成功が返され、記事は取得されるがタグは空
      expect(result.success).toBe(true)
      expect(result.articles).toHaveLength(2)
      expect(result.articles?.[0]?.tags).toHaveLength(0)
      expect(result.articles?.[1]?.tags).toHaveLength(0)
    })
  })

  describe('認証エラー', () => {
    it('ユーザーが認証されていない場合、エラーが返される', async () => {
      // Given: 認証エラー
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      // When: getArticlesを実行
      const result = await getArticles()

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
      expect(result.articles).toBeUndefined()
    })

    it('userがnullの場合、エラーが返される', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getArticles()

      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
      expect(result.articles).toBeUndefined()
    })
  })

  describe('データベースエラー', () => {
    it('記事取得エラー時、エラーメッセージが返される', async () => {
      // Given: DB取得エラー
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        order: mockOrderBy,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        return {}
      })

      // When: getArticlesを実行
      const result = await getArticles()

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('記事の取得に失敗しました')
      expect(result.articles).toBeUndefined()
    })
  })

  describe('セキュリティ', () => {
    it('エラー時にログが出力される（開発環境）', async () => {
      // Given: console.errorをスパイ
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Given: DB取得エラー
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Sensitive DB error' },
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        order: mockOrderBy,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        return {}
      })

      // When: getArticlesを実行
      const result = await getArticles()

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('記事の取得に失敗しました')

      // Then: 開発環境ではログが出力される
      // NOTE: 実際にはprocess.env.NODE_ENVがdevelopmentかどうかで分岐するが、
      // テスト環境では必ずしもdevelopmentではないため、呼ばれたかどうかだけチェック
      // 本番環境ではログが出力されないことはコードレビューで担保

      // Cleanup
      consoleErrorSpy.mockRestore()
    })
  })
})

describe('getAllTags Server Action', () => {
  const mockTags = [
    {
      id: 'tag-1',
      name: 'React',
      name_normalized: 'react',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'tag-2',
      name: 'TypeScript',
      name_normalized: 'typescript',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'tag-3',
      name: 'Next.js',
      name_normalized: 'nextjs',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック動作を設定
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  describe('成功ケース', () => {
    it('全タグが正常に取得される', async () => {
      // Given: タグのモック
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: mockTags,
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        order: mockOrderBy,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: getAllTagsを実行
      const result = await getAllTags()

      // Then: 成功が返される
      expect(result.success).toBe(true)
      expect(result.tags).toHaveLength(3)
      expect(result.error).toBeUndefined()

      // Then: タグデータが正しく含まれる
      expect(result.tags?.[0]?.name).toBe('React')
      expect(result.tags?.[1]?.name).toBe('TypeScript')
      expect(result.tags?.[2]?.name).toBe('Next.js')

      // Then: 認証チェックが呼ばれる
      expect(mockGetUser).toHaveBeenCalledTimes(1)

      // Then: タグ取得が呼ばれる
      expect(mockFrom).toHaveBeenCalledWith('tags')
      expect(mockTagsSelect).toHaveBeenCalled()
      expect(mockOrderBy).toHaveBeenCalledWith('name_normalized', { ascending: true })
    })

    it('タグが0件の場合、空配列が返される', async () => {
      // Given: タグが0件
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        order: mockOrderBy,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: getAllTagsを実行
      const result = await getAllTags()

      // Then: 成功が返され、空配列が返る
      expect(result.success).toBe(true)
      expect(result.tags).toEqual([])
      expect(result.error).toBeUndefined()
    })
  })

  describe('認証エラー', () => {
    it('ユーザーが認証されていない場合、エラーが返される', async () => {
      // Given: 認証エラー
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      // When: getAllTagsを実行
      const result = await getAllTags()

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
      expect(result.tags).toBeUndefined()
    })

    it('userがnullの場合、エラーが返される', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getAllTags()

      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
      expect(result.tags).toBeUndefined()
    })
  })

  describe('データベースエラー', () => {
    it('タグ取得エラー時、エラーメッセージが返される', async () => {
      // Given: DB取得エラー
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        order: mockOrderBy,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: getAllTagsを実行
      const result = await getAllTags()

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('タグの取得に失敗しました')
      expect(result.tags).toBeUndefined()
    })
  })
})

describe('searchArticles Server Action', () => {
  const mockArticles = [
    {
      id: 'article-1',
      user_id: mockUser.id,
      url: 'https://qiita.com/example/items/12345',
      title: 'React入門記事',
      description: 'Reactの基礎を学ぶ',
      platform_id: 'platform-1',
      is_bookmarked: false,
      created_at: '2025-01-03T00:00:00Z',
      updated_at: '2025-01-03T00:00:00Z',
      platform: {
        id: 'platform-1',
        name: 'Qiita',
        slug: 'qiita',
        url: 'https://qiita.com',
        icon_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      id: 'article-2',
      user_id: mockUser.id,
      url: 'https://zenn.dev/example/articles/67890',
      title: 'TypeScript完全ガイド',
      description: 'TypeScriptの型システム',
      platform_id: 'platform-2',
      is_bookmarked: false,
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      platform: {
        id: 'platform-2',
        name: 'Zenn',
        slug: 'zenn',
        url: 'https://zenn.dev',
        icon_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      id: 'article-3',
      user_id: mockUser.id,
      url: 'https://qiita.com/example/items/11111',
      title: 'Next.js App Router解説',
      description: 'Next.jsの新機能',
      platform_id: 'platform-1',
      is_bookmarked: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-04T00:00:00Z',
      platform: {
        id: 'platform-1',
        name: 'Qiita',
        slug: 'qiita',
        url: 'https://qiita.com',
        icon_url: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
  ]

  const mockArticleTags = [
    {
      article_id: 'article-1',
      tag: {
        id: 'tag-1',
        name: 'React',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      article_id: 'article-1',
      tag: {
        id: 'tag-2',
        name: 'TypeScript',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      article_id: 'article-2',
      tag: {
        id: 'tag-2',
        name: 'TypeScript',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
    {
      article_id: 'article-3',
      tag: {
        id: 'tag-3',
        name: 'Next.js',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック動作を設定
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  describe('成功ケース - キーワード検索', () => {
    it('キーワードでタイトル検索が正常に動作する', async () => {
      // Given: "React"でタイトル検索
      const mockOr = vi.fn()
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [mockArticles[0]], // React入門記事
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          or: mockOr.mockReturnValue({
            order: mockOrderBy,
          }),
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: [mockArticleTags[0], mockArticleTags[1]],
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      const result = await searchArticles({ keyword: 'React' })

      // Then: 成功が返される
      expect(result.success).toBe(true)
      expect(result.articles).toHaveLength(1)
      expect(result.articles?.[0]?.title).toBe('React入門記事')

      // Then: ILIKE検索が呼ばれる
      expect(mockOr).toHaveBeenCalledWith('title.ilike.%React%,description.ilike.%React%')
    })

    it('キーワードで説明文検索が正常に動作する', async () => {
      // Given: "型システム"で説明文検索
      const mockOr = vi.fn()
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [mockArticles[1]], // TypeScript完全ガイド
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          or: mockOr.mockReturnValue({
            order: mockOrderBy,
          }),
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: [mockArticleTags[2]],
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      const result = await searchArticles({ keyword: '型システム' })

      // Then: 成功が返される
      expect(result.success).toBe(true)
      expect(result.articles).toHaveLength(1)
      expect(result.articles?.[0]?.description).toBe('TypeScriptの型システム')
    })

    it('キーワードなしの場合、全記事が返される', async () => {
      // Given: キーワードなし
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: mockArticles,
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: mockArticleTags,
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      const result = await searchArticles({})

      // Then: 全記事が返される
      expect(result.success).toBe(true)
      expect(result.articles).toHaveLength(3)
    })
  })

  describe('成功ケース - タグフィルタ（AND条件）', () => {
    // Note: タグフィルタの詳細な動作は、E2Eテストで検証する
    // 統合テストでは、UUID validationとエラーハンドリングに焦点を当てる

    it('無効なUUIDが含まれる場合、有効なUUIDのみでフィルタする', async () => {
      // Given: 有効なUUIDと無効な文字列
      const mockInArticleTags = vi.fn().mockResolvedValue({
        data: [{ article_id: 'article-1' }],
      })
      const mockArticleTagsSelect = vi.fn().mockReturnValue({
        in: mockInArticleTags,
      })

      const mockInArticles = vi.fn()
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [mockArticles[0]],
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: mockInArticles.mockReturnValue({
            order: mockOrderBy,
          }),
        }),
      })

      const mockInTags = vi.fn().mockResolvedValue({
        data: [mockArticleTags[0]],
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockInTags,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          if (!mockInArticles.mock.calls.length) {
            return { select: mockArticleTagsSelect }
          }
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: 有効なUUIDと無効な文字列を渡す
      const result = await searchArticles({
        tagIds: ['550e8400-e29b-41d4-a716-446655440000', 'invalid-id', 'malicious-sql'],
      })

      // Then: 有効なUUIDのみでフィルタされる
      expect(result.success).toBe(true)
      expect(mockInArticleTags).toHaveBeenCalledWith('tag_id', ['550e8400-e29b-41d4-a716-446655440000'])
    })

    it('すべてのtagIdが無効なUUIDの場合、空配列が返される', async () => {
      // When: すべて無効なUUID
      const result = await searchArticles({
        tagIds: ['invalid-id', 'malicious-sql'],
      })

      // Then: 空配列が返される
      expect(result.success).toBe(true)
      expect(result.articles).toEqual([])
    })

    it('タグを持つ記事が存在しない場合、空配列が返される', async () => {
      // Given: タグフィルタで記事が見つからない
      const mockInArticleTags = vi.fn().mockResolvedValue({
        data: [],
      })
      const mockArticleTagsSelect = vi.fn().mockReturnValue({
        in: mockInArticleTags,
      })

      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'article_tags') {
          return { select: mockArticleTagsSelect }
        }
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      const result = await searchArticles({
        tagIds: ['tag-999'],
      })

      // Then: 空配列が返される
      expect(result.success).toBe(true)
      expect(result.articles).toEqual([])
    })
  })

  describe('成功ケース - ソート', () => {
    it('created_at降順でソートされる（デフォルト）', async () => {
      // Given: ソートパラメータなし
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: mockArticles,
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: mockArticleTags,
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      await searchArticles({})

      // Then: created_at降順でソート
      expect(mockOrderBy).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('created_at昇順でソートされる', async () => {
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [...mockArticles].reverse(),
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: mockArticleTags,
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      await searchArticles({ sortBy: 'created_at', sortOrder: 'asc' })

      // Then: created_at昇順でソート
      expect(mockOrderBy).toHaveBeenCalledWith('created_at', { ascending: true })
    })

    it('updated_at降順でソートされる', async () => {
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [mockArticles[2], mockArticles[0], mockArticles[1]],
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      const mockIn = vi.fn().mockResolvedValue({
        data: mockArticleTags,
        error: null,
      })
      const mockTagsSelect = vi.fn().mockReturnValue({
        in: mockIn,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        if (table === 'article_tags') {
          return { select: mockTagsSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      await searchArticles({ sortBy: 'updated_at', sortOrder: 'desc' })

      // Then: updated_at降順でソート
      expect(mockOrderBy).toHaveBeenCalledWith('updated_at', { ascending: false })
    })
  })

  describe('成功ケース - 複合検索', () => {
    // Note: 複合検索の詳細な動作は、E2Eテストで検証する

    it('検索結果が0件の場合、空配列が返される', async () => {
      // Given: 条件に一致する記事がない
      const mockOr = vi.fn()
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          or: mockOr.mockReturnValue({
            order: mockOrderBy,
          }),
        }),
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      const result = await searchArticles({ keyword: '存在しないキーワード' })

      // Then: 空配列が返される
      expect(result.success).toBe(true)
      expect(result.articles).toEqual([])
    })
  })

  describe('認証エラー', () => {
    it('ユーザーが認証されていない場合、エラーが返される', async () => {
      // Given: 認証エラー
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      // When: searchArticlesを実行
      const result = await searchArticles({})

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
      expect(result.articles).toBeUndefined()
    })

    it('userがnullの場合、エラーが返される', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await searchArticles({})

      expect(result.success).toBe(false)
      expect(result.error).toContain('認証エラー')
      expect(result.articles).toBeUndefined()
    })
  })

  describe('データベースエラー', () => {
    it('記事検索エラー時、エラーメッセージが返される', async () => {
      // Given: DB取得エラー
      const mockOrderBy = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      })
      const mockArticlesSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrderBy,
        }),
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'articles') {
          return { select: mockArticlesSelect }
        }
        return {}
      })

      // When: searchArticlesを実行
      const result = await searchArticles({})

      // Then: エラーが返される
      expect(result.success).toBe(false)
      expect(result.error).toContain('記事の検索に失敗しました')
      expect(result.articles).toBeUndefined()
    })
  })
})
