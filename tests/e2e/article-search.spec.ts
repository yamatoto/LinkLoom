import { test, expect } from '@playwright/test'

test.describe('記事検索・フィルタリング機能', () => {
  test.use({ storageState: 'tests/e2e/.auth/authenticated.json' })

  test.beforeEach(async ({ page }) => {
    // 記事一覧ページへ移動
    await page.goto('/articles', { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: '記事一覧' })).toBeVisible()
  })

  test.describe('キーワード検索', () => {
    test('検索バーにキーワードを入力すると記事が絞り込まれる', async ({
      page,
    }) => {
      // 検索バーにキーワードを入力
      const searchInput = page.getByPlaceholder('記事を検索...')
      await searchInput.fill('React')

      // URLパラメータが更新されることを確認
      await expect(page).toHaveURL(/keyword=React/)

      // 検索結果が表示されることを確認
      await expect(page.getByText(/件の記事が見つかりました/)).toBeVisible()
    })

    test('検索バーをクリアすると全記事が表示される', async ({ page }) => {
      // 検索バーにキーワードを入力
      const searchInput = page.getByPlaceholder('記事を検索...')
      await searchInput.fill('TypeScript')
      await expect(page).toHaveURL(/keyword=TypeScript/)

      // クリアボタンをクリック
      const clearButton = page.getByLabel('検索をクリア')
      await expect(clearButton).toBeVisible()
      await clearButton.click()

      // URLパラメータからkeywordが削除されることを確認
      await expect(page).not.toHaveURL(/keyword=/)

      // 検索バーが空になることを確認
      await expect(searchInput).toHaveValue('')
    })

    test('検索キーワードがない場合、クリアボタンが表示されない', async ({
      page,
    }) => {
      const clearButton = page.getByLabel('検索をクリア')
      await expect(clearButton).not.toBeVisible()
    })
  })

  test.describe('タグフィルタ', () => {
    test('タグを選択すると記事が絞り込まれる', async ({ page }) => {
      // タグフィルタの見出しが表示されることを確認
      await expect(page.getByText('タグでフィルタ')).toBeVisible()

      // 最初のタグを選択
      const firstTagCheckbox = page.locator('input[type="checkbox"]').first()
      if (await firstTagCheckbox.isVisible()) {
        await firstTagCheckbox.click()

        // URLパラメータにtagIdsが追加されることを確認
        await expect(page).toHaveURL(/tagIds=/)
      }
    })

    test('複数のタグを選択できる', async ({ page }) => {
      const checkboxes = page.locator('input[type="checkbox"]')
      const count = await checkboxes.count()

      if (count >= 2) {
        // 最初のタグを選択
        await checkboxes.nth(0).click()
        await expect(page).toHaveURL(/tagIds=/)

        // 2番目のタグを選択
        await checkboxes.nth(1).click()

        // URLパラメータに2つのタグIDが含まれることを確認（カンマ区切り）
        const url = page.url()
        const tagIdsParam = new URL(url).searchParams.get('tagIds')
        expect(tagIdsParam).toContain(',')
      }
    })

    test('選択したタグを解除できる', async ({ page }) => {
      const firstTagCheckbox = page.locator('input[type="checkbox"]').first()
      if (await firstTagCheckbox.isVisible()) {
        // タグを選択
        await firstTagCheckbox.click()
        await expect(page).toHaveURL(/tagIds=/)

        // 同じタグをもう一度クリックして解除
        await firstTagCheckbox.click()

        // URLパラメータからtagIdsが削除されることを確認
        await expect(page).not.toHaveURL(/tagIds=/)
      }
    })
  })

  test.describe('並び順', () => {
    test('並び順を変更できる', async ({ page }) => {
      // 並び順セレクトボックスをクリック
      const sortSelector = page.getByRole('combobox')
      await expect(sortSelector).toBeVisible()
      await sortSelector.click()

      // 「更新日（新しい順）」を選択
      await page.getByText('更新日（新しい順）').click()

      // URLパラメータが更新されることを確認
      await expect(page).toHaveURL(/sortBy=updated_at/)
      await expect(page).toHaveURL(/sortOrder=desc/)
    })

    test('並び順を「登録日（古い順）」に変更できる', async ({ page }) => {
      // 並び順セレクトボックスをクリック
      const sortSelector = page.getByRole('combobox')
      await sortSelector.click()

      // 「登録日（古い順）」を選択
      await page.getByText('登録日（古い順）').click()

      // URLパラメータが更新されることを確認
      await expect(page).toHaveURL(/sortBy=created_at/)
      await expect(page).toHaveURL(/sortOrder=asc/)
    })
  })

  test.describe('複合検索', () => {
    test('キーワード検索とタグフィルタを組み合わせられる', async ({
      page,
    }) => {
      // キーワードを入力
      const searchInput = page.getByPlaceholder('記事を検索...')
      await searchInput.fill('Next.js')
      await expect(page).toHaveURL(/keyword=Next\.js/)

      // タグを選択
      const firstTagCheckbox = page.locator('input[type="checkbox"]').first()
      if (await firstTagCheckbox.isVisible()) {
        await firstTagCheckbox.click()

        // 両方のパラメータがURLに含まれることを確認
        await expect(page).toHaveURL(/keyword=Next\.js/)
        await expect(page).toHaveURL(/tagIds=/)
      }
    })

    test('キーワード検索と並び順を組み合わせられる', async ({ page }) => {
      // キーワードを入力
      const searchInput = page.getByPlaceholder('記事を検索...')
      await searchInput.fill('TypeScript')
      await expect(page).toHaveURL(/keyword=TypeScript/)

      // 並び順を変更
      const sortSelector = page.getByRole('combobox')
      await sortSelector.click()
      await page.getByText('更新日（新しい順）').click()

      // 両方のパラメータがURLに含まれることを確認
      await expect(page).toHaveURL(/keyword=TypeScript/)
      await expect(page).toHaveURL(/sortBy=updated_at/)
      await expect(page).toHaveURL(/sortOrder=desc/)
    })
  })

  test.describe('ブラウザバック対応', () => {
    test('検索後にブラウザバックすると検索前の状態に戻る', async ({
      page,
    }) => {
      // 初期状態のURLを保存
      const initialUrl = page.url()

      // キーワードを入力
      const searchInput = page.getByPlaceholder('記事を検索...')
      await searchInput.fill('Vue')
      await expect(page).toHaveURL(/keyword=Vue/)

      // ブラウザバック
      await page.goBack()

      // 元のURLに戻ることを確認
      await expect(page).toHaveURL(initialUrl)

      // 検索バーが空になることを確認
      await expect(searchInput).toHaveValue('')
    })

    test('URLを直接編集して検索できる', async ({ page }) => {
      // URLにkeywordパラメータを追加
      await page.goto('/articles?keyword=React', { waitUntil: 'networkidle' })

      // 検索バーにキーワードが反映されることを確認
      const searchInput = page.getByPlaceholder('記事を検索...')
      await expect(searchInput).toHaveValue('React')

      // URLパラメータが正しく設定されることを確認
      await expect(page).toHaveURL(/keyword=React/)
    })
  })
})
