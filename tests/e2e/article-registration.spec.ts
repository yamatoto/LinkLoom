import { test, expect } from './fixtures/auth.fixture'

/**
 * E2Eスモークテスト: 記事登録フロー
 *
 * このテストは、記事登録の基本的なフローが動作することを検証します。
 *
 * テスト対象:
 * - 記事登録ページのアクセス
 * - 記事フォームの入力と送信
 * - プラットフォーム自動判定の表示
 * - 送信成功後のリダイレクト
 *
 * テスト戦略:
 * - スモークテスト（ハッピーパスのみ）
 * - バリデーションエラーはユニットテストで担保
 * - E2Eテストは主要フローが動作することを確認
 */

test.describe('記事登録スモークテスト', () => {
  test('認証済みユーザーが記事登録ページにアクセスできる', async ({
    authenticatedPage,
  }) => {
    // Given: 認証済み状態で記事登録ページにアクセス
    await authenticatedPage.goto('/articles/new')

    // Then: ページタイトルが表示される
    await expect(authenticatedPage).toHaveTitle(/LinkLoom/)

    // Then: フォームが表示される
    await expect(authenticatedPage.getByLabel(/記事URL/)).toBeVisible()
    await expect(authenticatedPage.getByLabel(/記事タイトル/)).toBeVisible()
    await expect(authenticatedPage.getByLabel(/説明/)).toBeVisible()
  })

  test('未認証ユーザーは記事登録ページにアクセスできない', async ({ page }) => {
    // Given: 未認証状態で記事登録ページにアクセスを試みる
    await page.goto('/articles/new')

    // Then: ログインページにリダイレクトされる
    await expect(page).toHaveURL(/\/login/)
  })

  test('ユーザーが記事を登録できる', async ({ authenticatedPage }) => {
    // Given: 記事登録ページにアクセス
    await authenticatedPage.goto('/articles/new')

    // When: フォームに入力
    const testArticleUrl = `https://qiita.com/test/items/e2e-test-${Date.now()}`
    await authenticatedPage.getByLabel(/記事URL/).fill(testArticleUrl)
    await authenticatedPage
      .getByLabel(/記事タイトル/)
      .fill('E2Eテスト記事タイトル')
    await authenticatedPage
      .getByLabel(/説明/)
      .fill('E2Eテスト用の記事説明文です')

    // Then: プラットフォーム自動判定が表示される
    await expect(authenticatedPage.getByText(/プラットフォーム:/)).toBeVisible()
    await expect(authenticatedPage.getByText('Qiita')).toBeVisible()

    // When: フォームを送信
    await authenticatedPage.getByRole('button', { name: /記事を保存/ }).click()

    // Then: 送信中の状態が表示される
    await expect(
      authenticatedPage.getByRole('button', { name: /保存中/ })
    ).toBeVisible()

    // Then: 送信成功後にリダイレクトされる（記事一覧またはダッシュボード）
    // NOTE: リダイレクト先は将来実装される記事一覧ページ
    // 現在は "/" にリダイレクトされる想定
    await expect(authenticatedPage).toHaveURL(/\/$/, { timeout: 5000 })
  })

  test('プラットフォーム自動判定が複数プラットフォームで動作する', async ({
    authenticatedPage,
  }) => {
    // Given: 記事登録ページにアクセス
    await authenticatedPage.goto('/articles/new')

    // Test 1: Zennの判定
    await authenticatedPage
      .getByLabel(/記事URL/)
      .fill('https://zenn.dev/user/articles/test')
    await authenticatedPage.getByLabel(/記事タイトル/).fill('Zenn記事')

    // Then: Zennが判定される
    await expect(authenticatedPage.getByText('Zenn')).toBeVisible()

    // Test 2: URLをクリアしてnoteを判定
    await authenticatedPage.getByLabel(/記事URL/).clear()
    await authenticatedPage
      .getByLabel(/記事URL/)
      .fill('https://note.com/user/n/n123')
    await authenticatedPage.getByLabel(/記事タイトル/).fill('note記事')

    // Then: noteが判定される
    await expect(authenticatedPage.getByText('note')).toBeVisible()
  })

  test('バリデーションエラーが表示される', async ({ authenticatedPage }) => {
    // Given: 記事登録ページにアクセス
    await authenticatedPage.goto('/articles/new')

    // When: URLを入力せずに送信
    await authenticatedPage
      .getByLabel(/記事タイトル/)
      .fill('タイトルのみ入力')
    await authenticatedPage.getByRole('button', { name: /記事を保存/ }).click()

    // Then: バリデーションエラーが表示される
    await expect(
      authenticatedPage.getByText(/URLを入力してください/)
    ).toBeVisible()

    // Then: ページ遷移しない
    await expect(authenticatedPage).toHaveURL(/\/articles\/new/)
  })

  test('送信ボタンが無効化されている間はフォームが再送信できない', async ({
    authenticatedPage,
  }) => {
    // Given: 記事登録ページにアクセス
    await authenticatedPage.goto('/articles/new')

    // When: フォームに入力
    await authenticatedPage
      .getByLabel(/記事URL/)
      .fill('https://zenn.dev/test/articles/test')
    await authenticatedPage.getByLabel(/記事タイトル/).fill('テスト記事')

    // When: フォームを送信
    const submitButton = authenticatedPage.getByRole('button', {
      name: /記事を保存/,
    })
    await submitButton.click()

    // Then: 送信ボタンが無効化される
    await expect(submitButton).toBeDisabled({ timeout: 500 })

    // Then: 入力フィールドも無効化される
    await expect(authenticatedPage.getByLabel(/記事URL/)).toBeDisabled()
    await expect(authenticatedPage.getByLabel(/記事タイトル/)).toBeDisabled()
    await expect(authenticatedPage.getByLabel(/説明/)).toBeDisabled()
  })
})
