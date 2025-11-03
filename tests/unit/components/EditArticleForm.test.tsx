import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EditArticleForm } from '@/app/articles/[id]/_components/EditArticleForm'
import type { ArticleFormData } from '@/schemas/article.schema'

const mockUpdateArticle = vi.hoisted(() => vi.fn())
const mockDeleteArticle = vi.hoisted(() => vi.fn())
const mockToastSuccess = vi.hoisted(() => vi.fn())
const mockToastError = vi.hoisted(() => vi.fn())
const mockPush = vi.hoisted(() => vi.fn())
const mockRefresh = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

vi.mock('@/app/actions/articles', () => ({
  updateArticle: mockUpdateArticle,
  deleteArticle: mockDeleteArticle,
}))

const defaultInitialValues: ArticleFormData = {
  url: 'https://zenn.dev/example/articles/edit-target',
  title: '編集前タイトル',
  description: '編集前の説明',
  tags: [],
  platform: '',
}

describe('EditArticleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateArticle.mockResolvedValue({ success: true })
    mockDeleteArticle.mockResolvedValue({ success: true })
  })

  it('記事を更新するとupdateArticleが呼ばれ、トーストとrefreshが実行される', async () => {
    const user = userEvent.setup()

    render(
      <EditArticleForm
        articleId="article-1"
        initialValues={defaultInitialValues}
        articleTitle="編集前タイトル"
      />
    )

    await user.click(screen.getByRole('button', { name: '記事を更新' }))

    await waitFor(() => {
      expect(mockUpdateArticle).toHaveBeenCalledWith('article-1', defaultInitialValues)
    })

    expect(mockToastSuccess).toHaveBeenCalledWith('記事を更新しました')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('更新に失敗した場合、エラートーストが表示される', async () => {
    const user = userEvent.setup()
    mockUpdateArticle.mockResolvedValueOnce({ success: false, error: '更新に失敗しました' })

    render(
      <EditArticleForm
        articleId="article-1"
        initialValues={defaultInitialValues}
        articleTitle="編集前タイトル"
      />
    )

    await user.click(screen.getByRole('button', { name: '記事を更新' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('更新に失敗しました')
    })

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('削除を確定するとdeleteArticleが呼ばれ、トーストと遷移が実行される', async () => {
    const user = userEvent.setup()

    render(
      <EditArticleForm
        articleId="article-1"
        initialValues={defaultInitialValues}
        articleTitle="編集前タイトル"
      />
    )

    await user.click(screen.getByRole('button', { name: '記事を削除' }))

    const confirmButton = await screen.findByRole('button', { name: '削除する' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteArticle).toHaveBeenCalledWith('article-1')
    })

    expect(mockToastSuccess).toHaveBeenCalledWith('記事を削除しました')
    expect(mockPush).toHaveBeenCalledWith('/articles')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('削除に失敗した場合、エラートーストが表示される', async () => {
    const user = userEvent.setup()
    mockDeleteArticle.mockResolvedValueOnce({ success: false, error: '削除に失敗しました' })

    render(
      <EditArticleForm
        articleId="article-1"
        initialValues={defaultInitialValues}
        articleTitle="編集前タイトル"
      />
    )

    await user.click(screen.getByRole('button', { name: '記事を削除' }))

    const confirmButton = await screen.findByRole('button', { name: '削除する' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('削除に失敗しました')
    })

    expect(mockPush).not.toHaveBeenCalled()
  })
})
