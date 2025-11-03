import { test, expect } from './fixtures/auth.fixture'
import type { Page } from '@playwright/test'

interface CreateArticleParams {
  url: string
  title: string
  description: string
}

async function createArticle(page: Page, params: CreateArticleParams) {
  await page.goto('/articles/new', { waitUntil: 'networkidle' })
  await page.getByLabel(/記事URL/).fill(params.url)
  await page.getByLabel(/記事タイトル/).fill(params.title)
  await page.getByLabel(/説明/).fill(params.description)
  await page.getByRole('button', { name: '記事を保存' }).click()
  await page.waitForURL('/articles', { timeout: 10000 })
  await expect(
    page.getByTestId('article-card').filter({ hasText: params.title }).first()
  ).toBeVisible()
}

test.describe('記事編集・削除フロー', () => {
  test('登録済みの記事を編集できる', async ({ authenticatedPage }) => {
    const timestamp = Date.now()
    const originalTitle = `E2E編集テスト ${timestamp}`
    const updatedTitle = `${originalTitle} 更新済み`
    const originalDescription = 'E2Eテスト用の編集前説明'
    const updatedDescription = 'E2Eテスト用の編集後説明'
    const articleUrl = `https://zenn.dev/e2e/edit-${timestamp}`

    await createArticle(authenticatedPage, {
      url: articleUrl,
      title: originalTitle,
      description: originalDescription,
    })

    const targetCard = authenticatedPage
      .getByTestId('article-card')
      .filter({ hasText: originalTitle })
      .first()

    const editLinkHref = await targetCard
      .getByRole('link', { name: /^編集$/ })
      .first()
      .getAttribute('href')
    expect(editLinkHref).not.toBeNull()
    await authenticatedPage.goto(editLinkHref!, { waitUntil: 'networkidle' })
    await expect(authenticatedPage).toHaveURL(`http://localhost:3000${editLinkHref}`)

    await authenticatedPage.getByLabel(/記事タイトル/).fill(updatedTitle)
    await authenticatedPage.getByLabel(/説明（任意）/).fill(updatedDescription)
    await authenticatedPage.getByRole('button', { name: '記事を更新' }).click()

    // 更新後は一覧画面に自動遷移
    await authenticatedPage.waitForURL('/articles', { timeout: 10000 })

    // 一覧画面で更新された記事が表示されることを確認
    await expect(
      authenticatedPage.getByTestId('article-card').filter({ hasText: updatedTitle })
    ).toBeVisible({ timeout: 5000 })

    // クリーンアップ: 編集後の記事を削除
    const updatedCard = authenticatedPage
      .getByTestId('article-card')
      .filter({ hasText: updatedTitle })
      .first()
    const deletePageHref = await updatedCard
      .getByRole('link', { name: /^編集$/ })
      .first()
      .getAttribute('href')
    await authenticatedPage.goto(deletePageHref!, { waitUntil: 'networkidle' })
    await authenticatedPage.getByRole('button', { name: '記事を削除' }).click()
    await authenticatedPage.getByRole('button', { name: '削除する' }).click()
    await authenticatedPage.waitForURL('/articles', { timeout: 10000 })
    await expect(
      authenticatedPage.getByTestId('article-card').filter({ hasText: updatedTitle })
    ).toHaveCount(0, { timeout: 10000 })
  })

  test('編集ページから記事を削除できる', async ({ authenticatedPage }) => {
    const timestamp = Date.now()
    const title = `E2E削除テスト ${timestamp}`
    const description = 'E2Eテスト用の削除対象記事'
    const articleUrl = `https://qiita.com/e2e/delete-${timestamp}`

    await createArticle(authenticatedPage, {
      url: articleUrl,
      title,
      description,
    })

    const targetCard = authenticatedPage
      .getByTestId('article-card')
      .filter({ hasText: title })
      .first()
    const deleteHref = await targetCard
      .getByRole('link', { name: /^編集$/ })
      .first()
      .getAttribute('href')
    expect(deleteHref).not.toBeNull()
    await authenticatedPage.goto(deleteHref!, { waitUntil: 'networkidle' })
    await authenticatedPage.getByRole('button', { name: '記事を削除' }).click()
    await authenticatedPage.getByRole('button', { name: '削除する' }).click()

    await authenticatedPage.waitForURL('/articles', { timeout: 10000 })
    await expect(
      authenticatedPage.getByTestId('article-card').filter({ hasText: title })
    ).toHaveCount(0, { timeout: 10000 })
  })
})
