import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SearchBar } from '@/components/articles/SearchBar'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Next.js Navigationのモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

// use-debounceのモック
vi.mock('use-debounce', () => ({
  useDebouncedCallback: vi.fn((fn) => fn),
}))

describe('SearchBar', () => {
  const mockPush = vi.fn()
  const mockPathname = '/articles'
  let mockSearchParams: URLSearchParams

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
    it('検索入力フィールドが表示される', () => {
      render(<SearchBar />)
      expect(screen.getByPlaceholderText('記事を検索...')).toBeInTheDocument()
    })

    it('検索アイコンが表示される', () => {
      render(<SearchBar />)
      const searchIcon = document.querySelector('svg')
      expect(searchIcon).toBeInTheDocument()
    })

    it('URLパラメータのkeywordが初期値として表示される', () => {
      mockSearchParams.set('keyword', 'React')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SearchBar />)
      expect(screen.getByDisplayValue('React')).toBeInTheDocument()
    })
  })

  describe('検索機能', () => {
    it('テキスト入力時にURLパラメータが更新される', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('記事を検索...')
      await user.type(input, 'TypeScript')

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('keyword=TypeScript')
        )
      })
    })

    it('空のテキストを入力するとkeywordパラメータが削除される', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('keyword', 'React')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SearchBar />)

      const input = screen.getByDisplayValue('React')
      await user.clear(input)

      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1]
        expect(lastCall[0]).not.toContain('keyword=')
      })
    })

    it('他のURLパラメータを保持したまま検索できる', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('sortBy', 'created_at')
      mockSearchParams.set('sortOrder', 'desc')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SearchBar />)

      const input = screen.getByPlaceholderText('記事を検索...')
      await user.type(input, 'Vue')

      await waitFor(() => {
        const lastCallArg = mockPush.mock.calls[mockPush.mock.calls.length - 1][0]
        expect(lastCallArg).toContain('sortBy=created_at')
        expect(lastCallArg).toContain('sortOrder=desc')
        expect(lastCallArg).toContain('keyword=Vue')
      })
    })
  })

  describe('クリア機能', () => {
    it('キーワードが入力されていない場合、クリアボタンが表示されない', () => {
      render(<SearchBar />)
      expect(screen.queryByLabelText('検索をクリア')).not.toBeInTheDocument()
    })

    it('キーワードが入力されている場合、クリアボタンが表示される', () => {
      mockSearchParams.set('keyword', 'React')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SearchBar />)
      expect(screen.getByLabelText('検索をクリア')).toBeInTheDocument()
    })

    it('クリアボタンクリック時に検索キーワードがクリアされる', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('keyword', 'React')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SearchBar />)

      const clearButton = screen.getByLabelText('検索をクリア')
      await user.click(clearButton)

      expect(mockPush).toHaveBeenCalledWith(
        expect.not.stringContaining('keyword=')
      )
    })

    it('クリアボタンクリック時に入力フィールドが空になる', async () => {
      const user = userEvent.setup()
      mockSearchParams.set('keyword', 'React')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SearchBar />)

      const clearButton = screen.getByLabelText('検索をクリア')
      await user.click(clearButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('記事を検索...')).toHaveValue('')
      })
    })
  })

  describe('URLパラメータとの同期', () => {
    it('URLパラメータが外部から変更された場合、入力フィールドが同期される', async () => {
      const { rerender } = render(<SearchBar />)

      // 初期状態
      expect(screen.getByPlaceholderText('記事を検索...')).toHaveValue('')

      // URLパラメータを外部から変更
      mockSearchParams.set('keyword', 'Next.js')
      const newMockSearchParams = new URLSearchParams('keyword=Next.js')
      vi.mocked(useSearchParams).mockReturnValue(newMockSearchParams as any)

      rerender(<SearchBar />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('記事を検索...')).toHaveValue('Next.js')
      })
    })
  })
})
