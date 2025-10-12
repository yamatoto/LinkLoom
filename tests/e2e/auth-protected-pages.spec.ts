import { test, expect } from './fixtures/auth.fixture'

/**
 * E2Eテスト: 保護されたページアクセス
 *
 * このテストは、認証が必要なページへのアクセス制御とリダイレクト動作を検証します。
 *
 * テスト対象:
 * - 未認証状態で保護されたページへアクセス → /loginへリダイレクト
 * - 認証後、元のページ（リダイレクト前のURL）へ戻る動作
 * - 認証済み状態で保護されたページに直接アクセスできること
 *
 * テスト戦略:
 * - Middlewareのページ保護ロジックを検証
 * - リダイレクトURLパラメータ（redirectTo）の動作確認
 * - 認証状態に応じたページアクセス可否の検証
 */

test.describe.skip('保護されたページアクセス', () => {
  test('未認証状態で /articles にアクセス時、/login へリダイレクトされる', async ({
    unauthenticatedPage,
  }) => {
    // When: 未認証状態で保護されたページ（/articles）にアクセス
    await unauthenticatedPage.goto('/articles')

    // Then: /login へリダイレクトされる
    await expect(unauthenticatedPage).toHaveURL(/\/login/)

    // Then: リダイレクトパラメータに元のURL（/articles）が含まれる
    const url = new URL(unauthenticatedPage.url())
    expect(url.searchParams.get('redirectTo')).toBe('/articles')

    // Then: ログインページのUI要素が表示される
    const googleButton = unauthenticatedPage.getByRole('button', {
      name: /Googleでログイン/i,
    })
    await expect(googleButton).toBeVisible()
  })

  test('認証後、元のページ（/articles）へリダイレクトされる', async ({
    unauthenticatedPage,
  }) => {
    // Given: redirectToパラメータ付きでログインページにアクセス
    await unauthenticatedPage.goto('/login?redirectTo=/articles')

    // When: Googleでログインボタンをクリック
    const googleButton = unauthenticatedPage.getByRole('button', {
      name: /Googleでログイン/i,
    })
    await googleButton.click()

    // Then: 認証成功後、元のページ（/articles）へリダイレクトされる
    await expect(unauthenticatedPage).toHaveURL('/articles')

    // Then: 記事ページのコンテンツが表示される
    // ヘッダーにログアウトボタンが表示されることを確認
    await expect(
      unauthenticatedPage.getByRole('button', { name: /ログアウト/i })
    ).toBeVisible()
  })

  test('認証済み状態で保護されたページに直接アクセスできる', async ({
    authenticatedPage,
  }) => {
    // When: 認証済み状態で保護されたページ（/articles）にアクセス
    await authenticatedPage.goto('/articles')

    // Then: ページに直接アクセスできる（リダイレクトされない）
    await expect(authenticatedPage).toHaveURL('/articles')

    // Then: ログアウトボタンが表示される（認証済み状態の確認）
    await expect(
      authenticatedPage.getByRole('button', { name: /ログアウト/i })
    ).toBeVisible()
  })

  test('未認証状態で複数の保護されたページへアクセス → それぞれ /login へリダイレクト', async ({
    unauthenticatedPage,
  }) => {
    // 保護されたページのリスト
    const protectedPages = ['/articles', '/articles/new', '/settings']

    for (const pagePath of protectedPages) {
      await test.step(`${pagePath} へのアクセスが /login へリダイレクトされる`, async () => {
        // When: 未認証状態で保護されたページにアクセス
        await unauthenticatedPage.goto(pagePath)

        // Then: /login へリダイレクトされる
        await expect(unauthenticatedPage).toHaveURL(/\/login/)

        // Then: リダイレクトパラメータに元のURLが含まれる
        const url = new URL(unauthenticatedPage.url())
        expect(url.searchParams.get('redirectTo')).toBe(pagePath)
      })
    }
  })

  test('認証済み状態でパブリックページ（/）へアクセスできる', async ({
    authenticatedPage,
  }) => {
    // When: 認証済み状態でパブリックページ（/）にアクセス
    await authenticatedPage.goto('/')

    // Then: ページに直接アクセスできる
    await expect(authenticatedPage).toHaveURL('/')

    // Then: ログアウトボタンが表示される（認証済み状態の確認）
    await expect(
      authenticatedPage.getByRole('button', { name: /ログアウト/i })
    ).toBeVisible()
  })

  test('未認証状態でパブリックページ（/）へアクセスできる', async ({
    unauthenticatedPage,
  }) => {
    // When: 未認証状態でパブリックページ（/）にアクセス
    await unauthenticatedPage.goto('/')

    // Then: ページに直接アクセスできる（リダイレクトされない）
    await expect(unauthenticatedPage).toHaveURL('/')

    // Then: ログインボタンが表示される（未認証状態の確認）
    const loginButton = unauthenticatedPage.getByRole('link', { name: /ログイン/i })
    await expect(loginButton).toBeVisible()
  })

  test('セッション期限切れ後、保護されたページにアクセス → /login へリダイレクト', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態で保護されたページにアクセス
    await authenticatedPage.goto('/articles')
    await expect(authenticatedPage).toHaveURL('/articles')

    // When: セッション期限切れをシミュレート（localStorageをクリア）
    await authenticatedPage.evaluate(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })

    // When: ページをリロード
    await authenticatedPage.reload()

    // Then: /login へリダイレクトされる
    await expect(authenticatedPage).toHaveURL(/\/login/)

    // Then: リダイレクトパラメータに元のURL（/articles）が含まれる
    const url = new URL(authenticatedPage.url())
    expect(url.searchParams.get('redirectTo')).toBe('/articles')
  })

  test('不正なredirectToパラメータはデフォルト（/）へリダイレクト', async ({
    unauthenticatedPage,
  }) => {
    // Given: 不正な外部URLをredirectToパラメータに設定
    await unauthenticatedPage.goto('/login?redirectTo=https://malicious-site.com')

    // When: Googleでログインボタンをクリック
    const googleButton = unauthenticatedPage.getByRole('button', {
      name: /Googleでログイン/i,
    })
    await googleButton.click()

    // Then: 認証成功後、デフォルトページ（/）へリダイレクトされる
    // セキュリティ: 外部URLへのリダイレクトを防ぐ
    await expect(unauthenticatedPage).toHaveURL('/')
  })
})
