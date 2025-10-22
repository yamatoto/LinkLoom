import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { TagFilter } from '@/components/articles/TagFilter'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { Tag } from '@/types/article'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Next.js Navigationのモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

describe('TagFilter', () => {
  const mockPush = vi.fn()
  const mockPathname = '/articles'
  let mockSearchParams: URLSearchParams

  const mockTags: Tag[] = [
    {
      id: 'tag-1',
      name: 'React',
      name_normalized: 'react',
      created_at: '2025-01-01',
    },
    {
      id: 'tag-2',
      name: 'TypeScript',
      name_normalized: 'typescript',
      created_at: '2025-01-02',
    },
    {
      id: 'tag-3',
      name: 'Next.js',
      name_normalized: 'nextjs',
      created_at: '2025-01-03',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as any)

    vi.mocked(usePathname).mockReturnValue(mockPathname)
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('レンダリング', () => {
    it('タグが0件の場合、「タグがありません」と表示される', () => {
      render(<TagFilter tags={[]} />)
      expect(screen.getByText('タグがありません')).toBeInTheDocument()
    })

    it('タグが1件以上ある場合、すべてのタグが表示される', () => {
      render(<TagFilter tags={mockTags} />)
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()
    })

    it('タグリストのタイトルが表示される', () => {
      render(<TagFilter tags={mockTags} />)
      expect(screen.getByText('タグでフィルタ')).toBeInTheDocument()
    })

    it('各タグにチェックボックスが表示される', () => {
      render(<TagFilter tags={mockTags} />)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(mockTags.length)
    })
  })

  describe('タグ選択機能', () => {
    it('タグをクリックすると選択状態になる', async () => {
      const user = userEvent.setup()
      render(<TagFilter tags={mockTags} />)

      const reactTag = screen.getByLabelText('React')
      await user.click(reactTag)

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('tagIds=tag-1')
      )
    })

    it('複数のタグを選択できる', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TagFilter tags={mockTags} />)

      const reactTag = screen.getByLabelText('React')
      await user.click(reactTag)

      // 最初のクリック後のURLパラメータを反映
      mockSearchParams.set('tagIds', 'tag-1')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)
      rerender(<TagFilter tags={mockTags} />)

      // 2つ目のタグをクリック
      const typescriptTag = screen.getByLabelText('TypeScript')
      await user.click(typescriptTag)

      // 最後の呼び出しを確認
      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
      expect(lastCall).toContain('tagIds=')
      expect(lastCall).toContain('tag-1')
      expect(lastCall).toContain('tag-2')
    })

    it('選択済みタグをクリックすると選択解除される', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('tagIds', 'tag-1')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<TagFilter tags={mockTags} />)

      const reactTag = screen.getByLabelText('React')
      await user.click(reactTag)

      // 最後の呼び出しでtagIdsが削除されているか確認
      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
      expect(lastCall).not.toContain('tagIds=')
    })

    it('複数選択から1つのタグを解除できる', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('tagIds', 'tag-1,tag-2')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<TagFilter tags={mockTags} />)

      const reactTag = screen.getByLabelText('React')
      await user.click(reactTag)

      // tag-2だけが残る
      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
      expect(lastCall).toContain('tagIds=tag-2')
      expect(lastCall).not.toContain('tag-1')
    })
  })

  describe('選択状態の表示', () => {
    it('URLパラメータで選択されているタグがチェック状態になる', () => {
      mockSearchParams.set('tagIds', 'tag-1,tag-3')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<TagFilter tags={mockTags} />)

      const reactCheckbox = screen.getByRole('checkbox', { name: /React/i })
      const nextjsCheckbox = screen.getByRole('checkbox', { name: /Next.js/i })
      const typescriptCheckbox = screen.getByRole('checkbox', {
        name: /TypeScript/i,
      })

      expect(reactCheckbox).toBeChecked()
      expect(nextjsCheckbox).toBeChecked()
      expect(typescriptCheckbox).not.toBeChecked()
    })

    it('URLパラメータがない場合、すべてのタグが未選択状態になる', () => {
      render(<TagFilter tags={mockTags} />)

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked()
      })
    })
  })

  describe('他のパラメータとの共存', () => {
    it('他のURLパラメータを保持したままタグを選択できる', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('keyword', 'React')
      mockSearchParams.set('sortBy', 'created_at')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<TagFilter tags={mockTags} />)

      const reactTag = screen.getByLabelText('React')
      await user.click(reactTag)

      const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
      expect(lastCall).toContain('keyword=React')
      expect(lastCall).toContain('sortBy=created_at')
      expect(lastCall).toContain('tagIds=tag-1')
    })
  })
})
