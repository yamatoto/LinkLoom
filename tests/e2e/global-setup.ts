import { chromium, FullConfig } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Playwright Global Setup - 実際のGoogle OAuth認証
 *
 * E2Eテストのベストプラクティス: 実際のブラウザ認証フローを1回実行
 *
 * **戦略**: Supabase test accountで実際にGoogle OAuthログイン
 * - テスト専用Googleアカウントで認証
 * - 認証状態を.auth/authenticated.jsonに保存
 * - 全テストでこの認証状態を再利用
 *
 * **メリット**:
 * - 実際の認証フローをテスト（プロダクションと完全に同じ）
 * - Supabase SSRの内部実装に依存しない
 * - Middlewareとの完全な互換性
 * - 保守が容易（モックロジック不要）
 *
 * **環境変数**:
 * - PLAYWRIGHT_TEST_GOOGLE_EMAIL: テスト用Googleアカウント
 * - PLAYWRIGHT_TEST_GOOGLE_PASSWORD: テスト用パスワード
 *
 * 参考: https://playwright.dev/docs/auth
 */
async function globalSetup(_config: FullConfig) {
  const authDir = path.join(__dirname, '.auth')

  // .authディレクトリが存在しない場合は作成
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const authFile = path.join(authDir, 'authenticated.json')

  // 既存の認証ファイルをチェック（セッション再利用）
  if (fs.existsSync(authFile)) {
    try {
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
      // Cookieが存在し、有効期限内かチェック
      if (authData.cookies && authData.cookies.length > 0) {
        const now = Date.now() / 1000 // Unix timestamp in seconds
        const hasValidCookie = authData.cookies.some((cookie: { expires?: number }) => {
          // expiresが-1の場合はセッションCookie（ブラウザ終了まで有効）
          // expiresが未来の場合は有効
          return !cookie.expires || cookie.expires === -1 || cookie.expires > now
        })

        if (hasValidCookie) {
          console.log('✅ 既存の認証セッションを再利用します')
          console.log(`📁 認証ファイル: ${authFile}`)
          return // 認証をスキップ
        } else {
          console.log('⚠️  既存の認証セッションが期限切れです。再認証します。')
        }
      }
    } catch (error) {
      console.warn('⚠️  既存の認証ファイルが破損しています。再認証します。', error)
    }
  }

  const testEmail = process.env.PLAYWRIGHT_TEST_GOOGLE_EMAIL
  const testPassword = process.env.PLAYWRIGHT_TEST_GOOGLE_PASSWORD

  if (!testEmail || !testPassword) {
    console.warn(
      '⚠️  テスト用Google認証情報が設定されていません。\n' +
        '   E2Eテストをスキップするか、以下の環境変数を設定してください:\n' +
        '   - PLAYWRIGHT_TEST_GOOGLE_EMAIL\n' +
        '   - PLAYWRIGHT_TEST_GOOGLE_PASSWORD'
    )

    // 認証情報がない場合、空のstorageStateを作成（未認証状態）
    fs.writeFileSync(
      authFile,
      JSON.stringify({
        cookies: [],
        origins: [],
      })
    )
    return
  }

  console.log('🔐 Global Setup: 実際のGoogle OAuth認証を実行中...')

  const browser = await chromium.launch({
    headless: process.env.CI === 'true', // CI環境ではheadless、ローカルではheaded
  })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Step 1: ログインページにアクセス
    console.log('📍 ログインページにアクセス中...')
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Step 2: 「Googleでログイン」ボタンをクリック
    console.log('🔘 Googleでログインボタンをクリック...')
    const loginButton = page.getByRole('button', { name: /Googleでログイン/i })
    await loginButton.click()

    // Step 3: Google OAuth画面でログイン
    // 新しいページ（ポップアップまたはリダイレクト）を待つ
    console.log('🌐 Google OAuth画面に遷移中...')

    // Google認証画面でメールアドレス入力
    await page.waitForURL(/accounts\.google\.com/, { timeout: 30000 })
    console.log('✉️  メールアドレスを入力中...')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill(testEmail)

    // メールアドレス画面の「次へ」ボタンをクリック
    // #identifierNext 内のボタンを特定
    await page.locator('#identifierNext button').click()

    // パスワード入力
    console.log('🔑 パスワードを入力中...')
    // Googleのパスワードフィールドは複数あるため、visible かつ name="Passwd" で特定
    const passwordInput = page.locator('input[name="Passwd"][type="password"]')
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
    await passwordInput.fill(testPassword)

    // パスワード画面の「次へ」ボタンをクリック
    // #passwordNext 内のボタンを特定
    await page.locator('#passwordNext button').click({ timeout: 10000 })

    // Step 4: 認証成功後、ダッシュボードへのリダイレクトを待つ
    console.log('⏳ 認証完了を待機中...')
    await page.waitForURL('http://localhost:3000/', {
      timeout: 30000,
      waitUntil: 'networkidle',
    })

    console.log('✅ 認証成功！ダッシュボードにリダイレクトされました')

    // Step 5: 認証状態をファイルに保存
    const authFile = path.join(authDir, 'authenticated.json')
    await context.storageState({ path: authFile })

    console.log(`💾 認証状態を保存しました: ${authFile}`)
    console.log('🎉 Global Setup 完了！')
  } catch (error) {
    console.error('❌ Global Setup 失敗:', error)

    // スクリーンショットを保存（デバッグ用）
    const screenshotPath = path.join(authDir, 'global-setup-error.png')
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.error(`📸 エラースクリーンショット保存: ${screenshotPath}`)

    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
