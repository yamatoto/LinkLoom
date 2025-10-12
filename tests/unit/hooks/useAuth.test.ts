import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { mockUser, mockSession, createMockAuthError } from '../../mocks/supabase'

// Next.js routerのモック
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Server Actionのモック
vi.mock('@/app/actions/auth', () => ({
  getDevAuthUser: vi.fn().mockResolvedValue(null),
}))

// Supabaseモック
const mockGetSession = vi.fn()
const mockSignInWithOAuth = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

// loggerのモック
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// テスト対象をインポート（モックの後に）
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック戻り値を設定
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    mockSignInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
      error: null,
    })

    mockSignOut.mockResolvedValue({
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })
  })

  describe('初期化', () => {
    it('初期状態ではloadingがtrueでuserがnull', async () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
    })

    it('セッション取得後、loadingがfalseになる', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockGetSession).toHaveBeenCalled()
    })

    it('セッションが存在する場合、userが設定される', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.loading).toBe(false)
      })
    })

    it('セッション取得エラー時、userはnullでloadingはfalse', async () => {
      const error = createMockAuthError('Session retrieval failed', 500)
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('signInWithGoogle', () => {
    it('Supabase signInWithOAuthが正しく呼び出される', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signInWithGoogle()

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('http://localhost:3000'),
        },
      })
      expect(response.error).toBeNull()
    })

    it('エラー時、errorオブジェクトが返される', async () => {
      const authError = createMockAuthError('OAuth failed', 400)
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: null },
        error: authError,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signInWithGoogle()

      expect(response.error).toEqual(authError)
    })
  })

  describe('signOut', () => {
    it('Supabase signOutが正しく呼び出される', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      const response = await result.current.signOut()

      expect(mockSignOut).toHaveBeenCalled()
      expect(response.error).toBeNull()
    })

    it('エラー時、errorオブジェクトが返される', async () => {
      const authError = createMockAuthError('Sign out failed', 500)
      mockSignOut.mockResolvedValue({
        error: authError,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signOut()

      expect(response.error).toEqual(authError)
    })
  })

  describe('onAuthStateChange', () => {
    it('onAuthStateChangeが登録される', async () => {
      renderHook(() => useAuth())

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })

    it('unmount時にsubscriptionがunsubscribeされる', async () => {
      const unsubscribeMock = vi.fn()
      mockOnAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: unsubscribeMock,
          },
        },
      })

      const { unmount } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })

      unmount()

      expect(unsubscribeMock).toHaveBeenCalled()
    })
  })

  describe('loading状態', () => {
    it('初期化中はloadingがtrue', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.loading).toBe(true)
    })

    it('セッション取得完了後、loadingがfalse', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })
})
