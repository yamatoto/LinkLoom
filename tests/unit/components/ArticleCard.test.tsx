import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArticleCard } from '@/components/articles/ArticleCard'
import type { ArticleWithPlatform } from '@/types/article'

describe('ArticleCard', () => {
  const mockArticle: ArticleWithPlatform = {
    id: '1',
    user_id: 'user-1',
    url: 'https://zenn.dev/example/articles/test',
    title: 'テスト記事タイトル',
    description: 'テスト記事の説明文です',
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
    tags: [
      {
        id: 'tag-1',
        name: 'React',
        name_normalized: 'react',
        created_at: '2025-10-19T00:00:00Z',
      },
      {
        id: 'tag-2',
        name: 'TypeScript',
        name_normalized: 'typescript',
        created_at: '2025-10-19T00:00:00Z',
      },
    ],
  }

  describe('レンダリング', () => {
    it('タイトルが正しく表示される', () => {
      render(<ArticleCard article={mockArticle} />)
      expect(screen.getByText('テスト記事タイトル')).toBeDefined()
    })

    it('説明文が正しく表示される', () => {
      render(<ArticleCard article={mockArticle} />)
      expect(screen.getByText('テスト記事の説明文です')).toBeDefined()
    })

    it('説明文がない場合、説明文が表示されない', () => {
      const articleWithoutDescription = { ...mockArticle, description: null }
      render(<ArticleCard article={articleWithoutDescription} />)
      expect(screen.queryByText('テスト記事の説明文です')).toBeNull()
    })

    it('日付が正しくフォーマットされて表示される', () => {
      render(<ArticleCard article={mockArticle} />)
      expect(screen.getByText('2025/10/19')).toBeDefined()
    })

    it('プラットフォームアイコンが表示される', () => {
      render(<ArticleCard article={mockArticle} />)
      const platformIcon = screen.getByLabelText('Zenn platform')
      expect(platformIcon).toBeDefined()
    })

    it('プラットフォームがnullの場合、Unknownアイコンが表示される', () => {
      const articleWithoutPlatform = { ...mockArticle, platform: null }
      render(<ArticleCard article={articleWithoutPlatform} />)
      const unknownIcon = screen.getByLabelText('Unknown platform')
      expect(unknownIcon).toBeDefined()
    })

    it('タグが正しく表示される', () => {
      render(<ArticleCard article={mockArticle} />)
      expect(screen.getByText('React')).toBeDefined()
      expect(screen.getByText('TypeScript')).toBeDefined()
    })

    it('タグがない場合、タグセクションが表示されない', () => {
      const articleWithoutTags = { ...mockArticle, tags: [] }
      const { container } = render(<ArticleCard article={articleWithoutTags} />)
      // タグセクションが含まれていないことを確認
      expect(container.textContent).not.toContain('React')
      expect(container.textContent).not.toContain('TypeScript')
    })

    it('タイトルリンクが正しく設定されている', () => {
      render(<ArticleCard article={mockArticle} />)
      const titleLink = screen.getByRole('link', { name: 'テスト記事タイトル' })
      expect(titleLink).toHaveAttribute('href', 'https://zenn.dev/example/articles/test')
      expect(titleLink).toHaveAttribute('target', '_blank')
      expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('編集ページへのリンクが表示される', () => {
      render(<ArticleCard article={mockArticle} />)
      const editLink = screen.getByRole('link', { name: '編集' })
      expect(editLink.getAttribute('href')).toBe('/articles/1')
    })
  })

  describe('アクセシビリティ', () => {
    it('プラットフォームアイコンにaria-labelが設定されている', () => {
      render(<ArticleCard article={mockArticle} />)
      const platformIcon = screen.getByLabelText('Zenn platform')
      expect(platformIcon).toBeDefined()
    })
  })
})
