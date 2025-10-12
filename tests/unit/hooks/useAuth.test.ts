import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// モックデータを直接定義（循環依存を回避）
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  app_metadata: {},
}

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
}

const createMockAuthError = (message: string, status?: number): AuthError =>
  ({
    name: 'AuthError',
    message,
    status,
    code: 'auth_error',
    __isAuthError: true,
  }) as unknown as AuthError

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

// Supabaseモック（vi.mock内で直接vi.fn()を定義）
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
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

// テスト対象とモックされたSupabaseをインポート
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// モック関数への参照を取得
const mockGetSession = supabase.auth.getSession as ReturnType<typeof vi.fn>
const mockSignInWithOAuth = supabase.auth.signInWithOAuth as ReturnType<typeof vi.fn>
const mockSignOut = supabase.auth.signOut as ReturnType<typeof vi.fn>
const mockOnAuthStateChange = supabase.auth
  .onAuthStateChange as ReturnType<typeof vi.fn>

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
