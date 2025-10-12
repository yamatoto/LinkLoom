import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { createMockAuthError } from '../../mocks/supabase'
import { toast } from 'sonner'

// sonnerのモック
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// useAuthフックのモック
const mockSignInWithGoogle = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    user: null,
    loading: false,
    signOut: vi.fn(),
  }),
}))

// loggerのモック
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('正しくボタンが表示される', () => {
      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      expect(button).toBeDefined()
      expect(button.hasAttribute('disabled')).toBe(false)
    })

    it('Googleアイコンが表示される', () => {
      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      const svg = button.querySelector('svg')
      expect(svg).not.toBeNull()
    })

    it('正しいスタイルが適用されている', () => {
      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      expect(button.className).toContain('bg-[#4285F4]')
    })
  })

  describe('クリック動作', () => {
    it('クリック時にsignInWithGoogleが呼び出される', async () => {
      mockSignInWithGoogle.mockResolvedValue({ error: null })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
      })
    })

    it('ローディング中はボタンが無効化される', async () => {
      mockSignInWithGoogle.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ error: null }), 100)
          })
      )

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      // ローディング中
      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(true)
        expect(screen.getByText('認証中...')).toBeDefined()
      })
    })

    it('ローディング中はスピナーが表示される', async () => {
      mockSignInWithGoogle.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ error: null }), 100)
          })
      )

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      // スピナーSVGが表示されることを確認
      await waitFor(() => {
        const spinner = button.querySelector('.animate-spin')
        expect(spinner).not.toBeNull()
      })
    })
  })

  describe('エラーハンドリング', () => {
    it('Google認証キャンセル時、適切なエラーメッセージが表示される', async () => {
      const error = createMockAuthError('popup_closed', 400)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
        const mockCalls = (toast.error as unknown as { mock: { calls: unknown[][] } }).mock.calls
        expect(mockCalls[0]?.[0]).toBeDefined()
        const callArg = mockCalls[0]![0] as string
        expect(callArg).toContain('認証がキャンセルされました')
      })
    })

    it('ネットワークエラー時、適切なエラーメッセージが表示される', async () => {
      const error = createMockAuthError('network error', 0)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
        const mockCalls = (toast.error as unknown as { mock: { calls: unknown[][] } }).mock.calls
        expect(mockCalls[0]?.[0]).toBeDefined()
        const callArg = mockCalls[0]![0] as string
        expect(callArg).toContain('ネットワークエラー')
      })
    })

    it('Supabase接続エラー時、適切なエラーメッセージが表示される', async () => {
      const error = createMockAuthError('supabase connection failed', 503)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
        const mockCalls = (toast.error as unknown as { mock: { calls: unknown[][] } }).mock.calls
        expect(mockCalls[0]?.[0]).toBeDefined()
        const callArg = mockCalls[0]![0] as string
        expect(callArg).toContain('サービスに接続できません')
      })
    })

    it('その他の認証エラー時、汎用エラーメッセージが表示される', async () => {
      const error = createMockAuthError('Unknown auth error', 500)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
        const mockCalls = (toast.error as unknown as { mock: { calls: unknown[][] } }).mock.calls
        expect(mockCalls[0]?.[0]).toBeDefined()
        const callArg = mockCalls[0]![0] as string
        expect(callArg).toContain('認証に失敗しました')
      })
    })

    it('エラー後、ボタンが再度有効化される', async () => {
      const error = createMockAuthError('Auth failed', 400)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(false)
      })
    })
  })

  describe('予期しないエラー', () => {
    it('try-catchで捕捉されたエラーが適切に処理される', async () => {
      mockSignInWithGoogle.mockRejectedValue(new Error('Unexpected error'))

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })

    it('予期しないエラー後、ボタンが再度有効化される', async () => {
      mockSignInWithGoogle.mockRejectedValue(new Error('Unexpected error'))

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(false)
      })
    })
  })

  describe('成功時の動作', () => {
    it('エラーがない場合、トースト通知は表示されない', async () => {
      mockSignInWithGoogle.mockResolvedValue({ error: null })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled()
      })

      expect(toast.error).not.toHaveBeenCalled()
    })
  })
})
