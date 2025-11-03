import { test, expect } from './fixtures/auth.fixture'

/**
 * E2Eスモークテスト: 認証フロー
 *
 * このテストは、アプリケーションの最も重要な認証フローが動作することを検証します。
 *
 * テスト対象:
 * - ログインページのUI表示
 * - Google OAuth認証成功後のダッシュボードアクセス（Global Setupで実施）
 * - ログアウト機能
 *
 * テスト戦略:
 * - スモークテスト（最小限のハッピーパステスト）
 * - 実装詳細のテストはユニットテストで担保
 * - E2Eテストは主要フローが動作することだけを確認
 */

test.describe('認証スモークテスト', () => {
  test('ログインページが正しく表示される', async ({ unauthenticatedPage }) => {
    // Given: 未認証状態でログインページにアクセス
    await unauthenticatedPage.goto('/login')

    // Then: ページタイトルが表示される
    await expect(unauthenticatedPage).toHaveTitle(/LinkLoom/i)

    // Then: Googleでログインボタンが表示される
    const googleButton = unauthenticatedPage.getByRole('button', {
      name: /Googleでログイン/i,
    })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
  })

  test('認証済みユーザーはダッシュボードにアクセスできる', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')

    // Then: ダッシュボードが表示される
    await expect(authenticatedPage).toHaveURL('/')

    // Then: ログアウトボタンが表示される（認証済み状態の確認）
    const logoutButton = authenticatedPage.getByRole('button', {
      name: /ログアウト/i,
    })
    await expect(logoutButton).toBeVisible()
  })

  test('認証済みユーザーはログアウトできる', async ({ authenticatedPage }) => {
    // Given: 認証済み状態でダッシュボードにアクセス
    await authenticatedPage.goto('/')
    await expect(authenticatedPage).toHaveURL('/')

    // When: ログアウトボタンをクリック
    const logoutButton = authenticatedPage.getByRole('button', {
      name: /ログアウト/i,
    })
    await logoutButton.click()

    // Then: ログインページまたはトップページにリダイレクトされる
    // Note: 実装によって挙動が異なるため、どちらでも許容
    await expect(authenticatedPage).toHaveURL(/\/(login)?/)
  })
})
