import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleList } from '@/components/articles/ArticleList'
import type { ArticleWithPlatform } from '@/types/article'

describe('ArticleList', () => {
  const mockArticles: ArticleWithPlatform[] = [
    {
      id: '1',
      user_id: 'user-1',
      url: 'https://zenn.dev/example/articles/test-1',
      title: 'テスト記事1',
      description: 'テスト記事1の説明文',
      platform_id: 'platform-1',
      is_bookmarked: false,
      created_at: '2025-10-19T00:00:00Z',
      updated_at: '2025-10-19T00:00:00Z',
      platform: {
        id: 'platform-1',
        slug: 'zenn',
        name: 'Zenn',
        name_normalized: 'zenn',
        created_at: '2025-10-19T00:00:00Z',
      },
      tags: [],
    },
    {
      id: '2',
      user_id: 'user-1',
      url: 'https://qiita.com/example/items/test-2',
      title: 'テスト記事2',
      description: 'テスト記事2の説明文',
      platform_id: 'platform-2',
      is_bookmarked: false,
      created_at: '2025-10-18T00:00:00Z',
      updated_at: '2025-10-18T00:00:00Z',
      platform: {
        id: 'platform-2',
        slug: 'qiita',
        name: 'Qiita',
        name_normalized: 'qiita',
        created_at: '2025-10-18T00:00:00Z',
      },
      tags: [],
    },
  ]

  describe('記事がある場合', () => {
    it('すべての記事が表示される', () => {
      render(<ArticleList articles={mockArticles} />)
      expect(screen.getByText('テスト記事1')).toBeDefined()
      expect(screen.getByText('テスト記事2')).toBeDefined()
    })

    it('グリッドレイアウトで表示される', () => {
      const { container } = render(<ArticleList articles={mockArticles} />)
      const grid = container.querySelector('.grid')
      expect(grid).not.toBeNull()
    })

    it('空状態メッセージが表示されない', () => {
      render(<ArticleList articles={mockArticles} />)
      expect(screen.queryByText('記事がありません')).toBeNull()
    })
  })

  describe('記事がない場合', () => {
    it('空状態メッセージが表示される', () => {
      render(<ArticleList articles={[]} />)
      expect(screen.getByText('記事がありません')).toBeDefined()
    })

    it('空状態の説明文が表示される', () => {
      render(<ArticleList articles={[]} />)
      expect(
        screen.getByText('まだ記事が登録されていません。最初の記事を登録してみましょう。')
      ).toBeDefined()
    })

    it('空状態のアイコンが表示される', () => {
      const { container } = render(<ArticleList articles={[]} />)
      const icon = container.querySelector('svg')
      expect(icon).not.toBeNull()
    })

    it('記事カードが表示されない', () => {
      render(<ArticleList articles={[]} />)
      expect(screen.queryByText('テスト記事1')).toBeNull()
    })
  })

  describe('レイアウト', () => {
    it('1記事の場合も正しく表示される', () => {
      render(<ArticleList articles={[mockArticles[0]!]} />)
      expect(screen.getByText('テスト記事1')).toBeDefined()
      expect(screen.queryByText('テスト記事2')).toBeNull()
    })

    it('多数の記事の場合も正しく表示される', () => {
      const manyArticles = Array.from({ length: 10 }, (_, i) => ({
        ...mockArticles[0]!,
        id: `article-${i}`,
        title: `テスト記事${i + 1}`,
      }))
      render(<ArticleList articles={manyArticles} />)
      expect(screen.getByText('テスト記事1')).toBeDefined()
      expect(screen.getByText('テスト記事10')).toBeDefined()
    })
  })
})
