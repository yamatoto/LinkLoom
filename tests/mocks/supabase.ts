import { vi } from 'vitest'
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'

/**
 * Supabase Authモックユーティリティ
 */

// モックユーザー
export const mockUser: User = {
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

// モックセッション
export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
}

// モックAuthError
export const createMockAuthError = (message: string, status?: number): AuthError =>
  ({
    name: 'AuthError',
    message,
    status,
    code: 'auth_error',
    __isAuthError: true,
  }) as unknown as AuthError

// onAuthStateChangeコールバック型
type AuthCallback = (event: AuthChangeEvent, session: Session | null) => void

// Supabaseモック
export const createSupabaseMock = () => {
  let authStateCallback: AuthCallback | null = null

  const mock = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: null,
      }),
      onAuthStateChange: vi.fn((callback: AuthCallback) => {
        authStateCallback = callback
        return {
          data: {
            subscription: {
              id: 'mock-subscription-id',
              unsubscribe: vi.fn(),
            },
          },
        }
      }),
    },
    // テスト用ヘルパー: 認証状態変更をトリガー
    _triggerAuthStateChange: (event: AuthChangeEvent, session: Session | null) => {
      if (authStateCallback) {
        authStateCallback(event, session)
      }
    },
  }

  return mock
}

// グローバルモック設定
export const setupSupabaseMock = () => {
  const mock = createSupabaseMock()

  vi.mock('@/lib/supabase', () => ({
    supabase: mock,
  }))

  return mock
}
