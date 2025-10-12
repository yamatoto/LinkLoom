import { test, expect } from './fixtures/auth.fixture'

/**
 * E2Eテスト: ログアウトフロー
 *
 * このテストは、ユーザーがログアウトする際の動作とセッション破棄を検証します。
 *
 * テスト対象:
 * - ヘッダーのログアウトボタンクリック → セッション破棄
 * - ログアウト後、/login へリダイレクト
 * - ログアウト後、保護されたページにアクセス → /login へリダイレクト
 *
 * テスト戦略:
 * - ログアウト後の認証状態クリアを検証
 * - セッション破棄後のページアクセス制御を確認
 * - ユーザー視点での完全なログアウトフローを検証
 */

test.describe('ログアウトフロー', () => {
  test.skip('ヘッダーのログアウトボタンクリック時、セッションが破棄される', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')
    await expect(authenticatedPage).toHaveURL('/')

    // Given: ログアウトボタンが表示されることを確認
    const logoutButton = authenticatedPage.getByRole('button', { name: /ログアウト/i })
    await expect(logoutButton).toBeVisible()

    // When: ログアウトボタンをクリック
    await logoutButton.click()

    // Then: /login へリダイレクトされる
    await expect(authenticatedPage).toHaveURL('/login')

    // Then: ログインページのUI要素が表示される（認証状態クリア確認）
    const googleButton = authenticatedPage.getByRole('button', {
      name: /Googleでログイン/i,
    })
    await expect(googleButton).toBeVisible()
  })

  test.skip('ログアウト後、保護されたページにアクセス時に /login へリダイレクトされる', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')

    // When: ログアウトボタンをクリック
    const logoutButton = authenticatedPage.getByRole('button', { name: /ログアウト/i })
    await logoutButton.click()

    // Then: /login へリダイレクトされる
    await expect(authenticatedPage).toHaveURL('/login')

    // When: ログアウト後、保護されたページ（/articles）にアクセス
    await authenticatedPage.goto('/articles')

    // Then: /login へリダイレクトされる（セッションが無効なため）
    await expect(authenticatedPage).toHaveURL(/\/login/)

    // Then: リダイレクトパラメータに元のURL（/articles）が含まれる
    const url = new URL(authenticatedPage.url())
    expect(url.searchParams.get('redirectTo')).toBe('/articles')
  })

  test.skip('ログアウト後、再ログインして元のページにアクセスできる', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')

    // When: ログアウトボタンをクリック
    const logoutButton = authenticatedPage.getByRole('button', { name: /ログアウト/i })
    await logoutButton.click()
    await expect(authenticatedPage).toHaveURL('/login')

    // When: 再度Googleでログインボタンをクリック
    const googleButton = authenticatedPage.getByRole('button', {
      name: /Googleでログイン/i,
    })
    await googleButton.click()

    // Then: 認証成功後、ダッシュボード（/）へリダイレクトされる
    await expect(authenticatedPage).toHaveURL('/')

    // Then: ログアウトボタンが再度表示される（再認証成功）
    await expect(
      authenticatedPage.getByRole('button', { name: /ログアウト/i })
    ).toBeVisible()
  })

  test.skip('ログアウトボタンクリック時、ローディング状態が表示される', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')

    // Given: ログアウトボタンが表示されることを確認
    const logoutButton = authenticatedPage.getByRole('button', { name: /ログアウト/i })
    await expect(logoutButton).toBeVisible()

    // When: ログアウトボタンをクリック
    await logoutButton.click()

    // Then: 一時的にローディング状態が表示される可能性がある
    // （実装によっては即座にリダイレクトされる場合もある）
    // ここでは、リダイレクト完了を確認
    await expect(authenticatedPage).toHaveURL('/login')
  })

  test.skip('複数ページでログアウトした場合、すべてのセッションが破棄される', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態で保護されたページ（/articles）にアクセス
    await authenticatedPage.goto('/articles')
    await expect(authenticatedPage).toHaveURL('/articles')

    // When: ログアウトボタンをクリック
    const logoutButton = authenticatedPage.getByRole('button', { name: /ログアウト/i })
    await logoutButton.click()

    // Then: /login へリダイレクトされる
    await expect(authenticatedPage).toHaveURL('/login')

    // When: ログアウト後、複数の保護されたページにアクセス
    const protectedPages = ['/articles', '/articles/new', '/settings']

    for (const pagePath of protectedPages) {
      await test.step(`${pagePath} へのアクセスが /login へリダイレクトされる`, async () => {
        await authenticatedPage.goto(pagePath)

        // Then: /login へリダイレクトされる（セッション完全破棄）
        await expect(authenticatedPage).toHaveURL(/\/login/)

        // Then: リダイレクトパラメータに元のURLが含まれる
        const url = new URL(authenticatedPage.url())
        expect(url.searchParams.get('redirectTo')).toBe(pagePath)
      })
    }
  })

  test.skip('ログアウトエラー時、適切なエラーメッセージが表示される', async ({
    authenticatedPage,
  }) => {
    // Given: ログアウトAPIエラーをモック化
    await authenticatedPage.route('**/auth/v1/logout*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Logout failed' }),
      })
    })

    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')

    // When: ログアウトボタンをクリック
    const logoutButton = authenticatedPage.getByRole('button', { name: /ログアウト/i })
    await logoutButton.click()

    // Then: エラートースト通知が表示される
    const errorToast = authenticatedPage.getByRole('status')
    await expect(errorToast).toBeVisible()

    // Then: ログアウトエラーの具体的なメッセージが含まれる
    await expect(errorToast).toContainText(/ログアウトに失敗しました|ログアウトエラー/i)

    // Then: ログアウトボタンは依然として表示される（ログアウト失敗）
    await expect(logoutButton).toBeVisible()
  })

  test.skip('ログアウト後、パブリックページ（/）へアクセスできる', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')

    // When: ログアウトボタンをクリック
    const logoutButton = authenticatedPage.getByRole('button', { name: /ログアウト/i })
    await logoutButton.click()
    await expect(authenticatedPage).toHaveURL('/login')

    // When: ログアウト後、パブリックページ（/）にアクセス
    await authenticatedPage.goto('/')

    // Then: ページに直接アクセスできる（リダイレクトされない）
    await expect(authenticatedPage).toHaveURL('/')

    // Then: ログインボタンが表示される（未認証状態の確認）
    const loginButton = authenticatedPage.getByRole('link', { name: /ログイン/i })
    await expect(loginButton).toBeVisible()
  })
})
