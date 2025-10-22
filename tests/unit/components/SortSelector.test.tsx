import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SortSelector } from '@/components/articles/SortSelector'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Next.js Navigationのモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

describe('SortSelector', () => {
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
    it('並び順セレクトボックスが表示される', () => {
      render(<SortSelector />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('デフォルトで「登録日（新しい順）」が選択されている', () => {
      render(<SortSelector />)
      // デフォルトの表示テキストを確認
      expect(screen.getByText('登録日（新しい順）')).toBeInTheDocument()
    })
  })

  describe('並び順選択機能', () => {
    it('デフォルトで「登録日（新しい順）」が表示されている', () => {
      render(<SortSelector />)

      // デフォルトの表示テキストを確認
      expect(screen.getByText('登録日（新しい順）')).toBeInTheDocument()
    })

    it('並び順を「更新日（新しい順）」に変更した場合、表示が更新される', () => {
      mockSearchParams.set('sortBy', 'updated_at')
      mockSearchParams.set('sortOrder', 'desc')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SortSelector />)

      expect(screen.getByText('更新日（新しい順）')).toBeInTheDocument()
    })

    it('並び順を「更新日（古い順）」に変更した場合、表示が更新される', () => {
      mockSearchParams.set('sortBy', 'updated_at')
      mockSearchParams.set('sortOrder', 'asc')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SortSelector />)

      expect(screen.getByText('更新日（古い順）')).toBeInTheDocument()
    })
  })

  describe('URLパラメータからの初期値設定', () => {
    it('URLパラメータが「登録日（古い順）」の場合、その値が表示されている', () => {
      mockSearchParams.set('sortBy', 'created_at')
      mockSearchParams.set('sortOrder', 'asc')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SortSelector />)
      expect(screen.getByText('登録日（古い順）')).toBeInTheDocument()
    })

    it('URLパラメータが「更新日（新しい順）」の場合、その値が表示されている', () => {
      mockSearchParams.set('sortBy', 'updated_at')
      mockSearchParams.set('sortOrder', 'desc')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SortSelector />)
      expect(screen.getByText('更新日（新しい順）')).toBeInTheDocument()
    })

    it('URLパラメータが「更新日（古い順）」の場合、その値が表示されている', () => {
      mockSearchParams.set('sortBy', 'updated_at')
      mockSearchParams.set('sortOrder', 'asc')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SortSelector />)
      expect(screen.getByText('更新日（古い順）')).toBeInTheDocument()
    })

    it('URLパラメータがない場合、デフォルト値が表示されている', () => {
      render(<SortSelector />)
      expect(screen.getByText('登録日（新しい順）')).toBeInTheDocument()
    })
  })

  describe('他のパラメータとの共存', () => {
    it('他のURLパラメータを保持したままレンダリングできる', () => {
      mockSearchParams.set('keyword', 'React')
      mockSearchParams.set('tagIds', 'tag-1,tag-2')
      mockSearchParams.set('sortBy', 'updated_at')
      mockSearchParams.set('sortOrder', 'desc')
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)

      render(<SortSelector />)

      expect(screen.getByText('更新日（新しい順）')).toBeInTheDocument()
    })
  })

  describe('セレクトボックスの存在確認', () => {
    it('セレクトボックスが正しくレンダリングされる', () => {
      render(<SortSelector />)

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect(select).toHaveAttribute('type', 'button')
    })
  })
})
