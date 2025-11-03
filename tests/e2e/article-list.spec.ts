import { test, expect } from '@playwright/test'

test.describe('記事一覧ページ', () => {
  test.use({ storageState: 'tests/e2e/.auth/authenticated.json' })

  test('ログイン状態で記事一覧が表示される', async ({ page }) => {
    // 記事一覧ページへ移動
    await page.goto('/articles', { waitUntil: 'networkidle' })

    // タイトルが表示されることを確認
    await expect(page.getByRole('heading', { name: '記事一覧' })).toBeVisible()

    // 記事カードが表示されることを確認（少なくとも1つ）
    const articleCards = page.getByTestId('article-card')
    await expect(articleCards.first()).toBeVisible()
  })

  test('記事カードに必要な情報が表示される', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'networkidle' })

    // 最初の記事カードを取得
    const firstCard = page.getByTestId('article-card').first()
    await expect(firstCard).toBeVisible()

    // カード内に日付が含まれていることを確認（YYYY/MM/DD形式）
    await expect(firstCard.getByText(/\d{4}\/\d{2}\/\d{2}/)).toBeVisible()

    // タイトルが表示されることを確認（h3要素）
    const cardTitle = firstCard.locator('h3').first()
    await expect(cardTitle).toBeVisible()
  })

  test('記事カードをクリックすると外部リンクで開く', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'networkidle' })

    const firstCard = page.getByTestId('article-card').first()
    const openLink = firstCard.getByRole('link', { name: '記事を開く' })
    await expect(openLink).toHaveAttribute('href', /https?:\/\//)
    await expect(openLink).toHaveAttribute('target', '_blank')
    await expect(openLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('「記事を登録」ボタンが表示され、クリックで登録ページに遷移する', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'networkidle' })

    // 「記事を登録」ボタンをクリック
    await page.getByRole('link', { name: '記事を登録' }).click()

    // 登録ページに遷移することを確認
    await expect(page).toHaveURL('/articles/new')
    await expect(page.getByRole('heading', { name: '記事を登録' })).toBeVisible()
  })

  test('記事数が表示される', async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'networkidle' })

    // 「○件の記事が見つかりました」または「記事を登録してください」が表示される
    const countText = page.getByText(/件の記事が見つかりました|記事を登録してください/)
    await expect(countText).toBeVisible()
  })

  test('未認証状態ではログインページにリダイレクトされる', async ({ browser }) => {
    // 新しいコンテキストを作成（認証なし）
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()

    // 記事一覧ページへ移動
    await page.goto('/articles', { waitUntil: 'networkidle' })

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login\?redirect=%2Farticles$/)

    await context.close()
  })
})
