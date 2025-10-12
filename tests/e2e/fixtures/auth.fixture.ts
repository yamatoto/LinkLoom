import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Playwright E2Eテスト用認証フィクスチャ（storageStateベース）
 *
 * このフィクスチャは、Playwrightの公式推奨パターン（storageState）を使用して
 * 認証状態を管理します。
 *
 * 認証の仕組み:
 * 1. Global Setup（tests/e2e/global-setup.ts）で1回だけ認証を実行
 * 2. 認証状態を .auth/authenticated.json に保存
 * 3. playwright.config.ts でデフォルトのstorageStateに設定
 * 4. 各テストは自動的に認証済み状態で開始
 *
 * メリット:
 * - Supabase SSRの内部実装に依存しない（実際のブラウザ認証を使用）
 * - テストが高速（認証は1回のみ）
 * - 保守が容易（モックロジック不要）
 * - middlewareとの完全な互換性
 */

export interface AuthFixtures {
  authenticatedPage: Page
  unauthenticatedPage: Page
}

/**
 * Playwrightテスト拡張: 認証済み/未認証ページフィクスチャ
 */
export const test = base.extend<AuthFixtures>({
  /**
   * 認証済みページ
   *
   * デフォルトのstorageState（playwright.config.tsで設定）を使用するため、
   * 特別な処理は不要。Global Setupで保存された認証状態が自動的に適用される。
   */
  authenticatedPage: async ({ page }, use) => {
    await use(page)
  },

  /**
   * 未認証ページ
   *
   * storageStateをクリアした新しいブラウザコンテキストを作成。
   * これにより、認証情報がない状態（未ログイン）でテストを開始できる。
   */
  unauthenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect } from '@playwright/test'
