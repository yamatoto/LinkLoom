import { chromium, FullConfig } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Playwright Global Setup
 *
 * テストスイート実行前に1回だけ実行される認証セットアップ
 * 認証状態をファイルに保存することで、以降のすべてのテストで再利用できる。
 *
 * **TODO: 実際のGoogle OAuth認証フローの実装が必要**
 * 現在は暫定的にダッシュボードにアクセスしてstorageStateを保存しているが、
 * 本来は実際のGoogle OAuth認証フローを実行すべき。
 *
 * メリット:
 * - テストが高速（認証は1回のみ）
 * - 実際のブラウザ認証を使うため100%互換性
 * - Supabase SSRの内部実装に依存しない
 * - 保守が容易
 */
async function globalSetup(_config: FullConfig) {
  const authDir = path.join(__dirname, '.auth')

  // .authディレクトリが存在しない場合は作成
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('🔐 Global Setup: 認証状態を作成中...')

  try {
    // TODO: 実際のGoogle OAuth認証フローを実装
    // 現在は暫定的にダッシュボードにアクセスしてstorageStateを保存
    // 本来は実際のGoogle OAuth認証を実行すべき
    await page.goto('http://localhost:3000/', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    console.log('📍 ダッシュボードにアクセスしました')

    // 認証状態をファイルに保存
    const authFile = path.join(authDir, 'authenticated.json')
    await context.storageState({ path: authFile })

    console.log(`💾 認証状態を保存しました: ${authFile}`)
  } catch (error) {
    console.error('❌ Global Setup 失敗:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
