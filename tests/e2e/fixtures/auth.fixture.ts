import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Playwright E2Eテスト用認証フィクスチャ
 *
 * このフィクスチャは、E2Eテストでのモック認証セットアップを提供します。
 * 実際のSupabase OAuth認証をモック化し、テスト環境での安定した認証フローを実現します。
 */

export interface AuthFixtures {
  authenticatedPage: Page
  unauthenticatedPage: Page
}

/**
 * モックユーザー情報
 */
export const mockAuthUser = {
  id: 'e2e-test-user-id',
  email: 'e2e-test@example.com',
  user_metadata: {
    full_name: 'E2E Test User',
    avatar_url: 'https://example.com/e2e-avatar.jpg',
  },
}

/**
 * モックセッション情報
 */
export const mockAuthSession = {
  access_token: 'e2e-mock-access-token',
  refresh_token: 'e2e-mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockAuthUser,
}

/**
 * 認証済みページをセットアップ
 * localStorage経由でSupabaseクライアント側のセッションを確立
 *
 * Note: サーバー側（middleware）の認証は、モックされたSupabase APIエンドポイントで担保
 */
async function setupAuthenticatedPage(page: Page): Promise<void> {
  // NEXT_PUBLIC_SUPABASE_URLから project-ref を取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

  // Supabase JSクライアントが認識する正しい形式でlocalStorageに注入
  await page.addInitScript(
    ({ session, storageKey }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(session))
    },
    {
      session: mockAuthSession,
      storageKey: `sb-${projectRef}-auth-token`,
    }
  )
}

/**
 * Supabase OAuth認証APIレスポンスをモック化
 */
async function mockSupabaseAuth(page: Page): Promise<void> {
  // すべてのSupabase Auth APIエンドポイントをモック
  await page.route('**/auth/v1/**', async (route) => {
    const url = new URL(route.request().url())
    const pathname = url.pathname

    console.log('[E2E Mock] Intercepted Supabase request:', pathname, url.search)

    // /auth/v1/token エンドポイント (token exchange & refresh)
    if (pathname.includes('/token')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: mockAuthSession.access_token,
          refresh_token: mockAuthSession.refresh_token,
          expires_in: mockAuthSession.expires_in,
          expires_at: mockAuthSession.expires_at,
          token_type: mockAuthSession.token_type,
          user: mockAuthUser,
        }),
      })
      return
    }

    // /auth/v1/user エンドポイント (getUser)
    if (pathname.includes('/user')) {
      const authHeader = route.request().headers()['authorization']

      if (authHeader?.includes(mockAuthSession.access_token)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockAuthUser),
        })
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' }),
        })
      }
      return
    }

    // /auth/v1/logout エンドポイント
    if (pathname.includes('/logout')) {
      await route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      })
      return
    }

    // その他のAuthエンドポイントはデフォルトで成功を返す
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })

  // Google OAuth URLへのリダイレクトをモック化
  await page.route('**/auth/v1/authorize*', async (route) => {
    const url = new URL(route.request().url())
    const redirectTo = url.searchParams.get('redirect_to') || 'http://localhost:3000'

    // NEXT_PUBLIC_SUPABASE_URLから project-ref を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

    // モック認証成功後、localStorageにセッションを保存してからリダイレクト
    // Supabaseの実際の動作: ハッシュフラグメントでトークンを返すが、
    // E2Eテストでは直接localStorageに保存する方が安定
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <!DOCTYPE html>
        <html>
          <head><title>OAuth Callback</title></head>
          <body>
            <script>
              // Supabaseクライアントが認識する形式でlocalStorageに保存
              localStorage.setItem(
                'sb-${projectRef}-auth-token',
                JSON.stringify(${JSON.stringify(mockAuthSession)})
              );
              // リダイレクト先へ遷移
              window.location.href = '${redirectTo}';
            </script>
          </body>
        </html>
      `,
    })
  })

  // セッション取得APIをモック (getUser)
  await page.route('**/auth/v1/user*', async (route) => {
    const authHeader = route.request().headers()['authorization']

    // Authorizationヘッダーがあるか、クッキーが存在する場合は認証成功
    if (authHeader?.includes(mockAuthSession.access_token)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAuthUser),
      })
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      })
    }
  })

  // getSession APIをモック (middleware用)
  await page.route('**/auth/v1/session*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: mockAuthSession.access_token,
        refresh_token: mockAuthSession.refresh_token,
        expires_in: mockAuthSession.expires_in,
        expires_at: mockAuthSession.expires_at,
        token_type: mockAuthSession.token_type,
        user: mockAuthUser,
      }),
    })
  })

  // ログアウトAPIをモック
  await page.route('**/auth/v1/logout*', async (route) => {
    await route.fulfill({
      status: 204,
      contentType: 'application/json',
      body: '',
    })
  })
}

/**
 * Playwrightテスト拡張: 認証済み/未認証ページフィクスチャ
 */
export const test = base.extend<AuthFixtures>({
  /**
   * 認証済みページ: モックセッションが注入された状態でテスト開始
   */
  authenticatedPage: async ({ page }, applyFixture) => {
    await mockSupabaseAuth(page)
    await setupAuthenticatedPage(page)
    await applyFixture(page)
  },

  /**
   * 未認証ページ: デフォルトの未認証状態でテスト開始
   */
  unauthenticatedPage: async ({ page }, applyFixture) => {
    await mockSupabaseAuth(page)
    await applyFixture(page)
  },
})

export { expect } from '@playwright/test'
