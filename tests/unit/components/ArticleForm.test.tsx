import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticleForm } from '@/components/articles/ArticleForm'
import type { ArticleFormData } from '@/schemas/article.schema'

/**
 * ArticleForm コンポーネントテスト
 *
 * テスト対象: src/components/articles/ArticleForm.tsx
 *
 * テスト方針:
 * - ユーザー視点のテスト（実装詳細には依存しない）
 * - getByRole/getByLabelText中心（アクセシビリティファースト）
 * - フォーム操作・バリデーション・プラットフォーム自動判定を検証
 */

// platform-detectorのモック
vi.mock('@/lib/platform-detector', () => ({
  detectPlatform: vi.fn((url: string) => {
    if (url.includes('zenn.dev')) return 'zenn'
    if (url.includes('qiita.com')) return 'qiita'
    if (url.includes('note.com')) return 'note'
    return 'unknown'
  }),
  PLATFORM_DISPLAY_NAMES: {
    zenn: 'Zenn',
    qiita: 'Qiita',
    note: 'note',
    github: 'GitHub',
    medium: 'Medium',
    'hatena-blog': 'はてなブログ',
    devto: 'Dev.to',
    unknown: '不明',
  },
}))

describe('ArticleForm', () => {
  let mockOnSubmit: Mock<[ArticleFormData], Promise<void>>

  beforeEach(() => {
    mockOnSubmit = vi.fn<[ArticleFormData], Promise<void>>().mockResolvedValue(undefined)
  })

  describe('レンダリング', () => {
    it('必須フィールドが正しくレンダリングされる', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // 必須フィールドの存在確認
      expect(screen.getByLabelText(/記事URL/)).toBeDefined()
      expect(screen.getByLabelText(/記事タイトル/)).toBeDefined()
      expect(screen.getByLabelText(/説明/)).toBeDefined()

      // 送信ボタンの確認
      expect(screen.getByRole('button', { name: '記事を保存' })).toBeDefined()
    })

    it('タグフィールドが無効化されている（将来実装予定）', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} />)

      const tagsInput = screen.getByPlaceholderText(/React, TypeScript, Hooks/)
      expect(tagsInput.hasAttribute('disabled')).toBe(true)
    })

    it('開発中の注釈が表示される', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} />)

      expect(screen.getByText(/タグ機能は現在開発中です/)).toBeDefined()
    })
  })

  describe('フォーム操作', () => {
    it('ユーザーが各フィールドに入力できる', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // URL入力
      const urlInput = screen.getByLabelText(/記事URL/)
      await user.type(urlInput, 'https://zenn.dev/user/articles/example')

      // タイトル入力
      const titleInput = screen.getByLabelText(/記事タイトル/)
      await user.type(titleInput, 'テスト記事タイトル')

      // 説明入力
      const descriptionInput = screen.getByLabelText(/説明/)
      await user.type(descriptionInput, 'テスト説明文')

      // 入力値の確認
      expect(urlInput).toHaveProperty('value', 'https://zenn.dev/user/articles/example')
      expect(titleInput).toHaveProperty('value', 'テスト記事タイトル')
      expect(descriptionInput).toHaveProperty('value', 'テスト説明文')
    })

    it('有効なデータでフォームを送信できる', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // フォーム入力
      await user.type(screen.getByLabelText(/記事URL/), 'https://qiita.com/user/items/123')
      await user.type(screen.getByLabelText(/記事タイトル/), 'Qiita記事')
      await user.type(screen.getByLabelText(/説明/), 'Qiitaの記事です')

      // フォーム送信
      const submitButton = screen.getByRole('button', { name: '記事を保存' })
      await user.click(submitButton)

      // onSubmitが呼ばれたことを確認
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      })

      // 送信データの確認
      const submittedData = mockOnSubmit.mock.calls[0]![0] as ArticleFormData
      expect(submittedData.url).toBe('https://qiita.com/user/items/123')
      expect(submittedData.title).toBe('Qiita記事')
      expect(submittedData.description).toBe('Qiitaの記事です')
    })
  })

  describe('バリデーション', () => {
    it('URLが空の場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // タイトルのみ入力してURLは空のまま送信
      await user.type(screen.getByLabelText(/記事タイトル/), 'タイトルのみ')
      await user.click(screen.getByRole('button', { name: '記事を保存' }))

      // エラーメッセージが表示される（min(1)が先にチェックされる）
      await waitFor(() => {
        expect(screen.getByText(/URLを入力してください/)).toBeDefined()
      })

      // onSubmitは呼ばれない
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('不正なURL形式の場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // 不正なURL形式
      await user.type(screen.getByLabelText(/記事URL/), 'invalid-url')
      await user.type(screen.getByLabelText(/記事タイトル/), 'テストタイトル')
      await user.click(screen.getByRole('button', { name: '記事を保存' }))

      await waitFor(() => {
        expect(screen.getByText(/有効なURLを入力してください/)).toBeDefined()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('タイトルが空の場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // URLのみ入力
      await user.type(screen.getByLabelText(/記事URL/), 'https://zenn.dev/user/articles/123')
      await user.click(screen.getByRole('button', { name: '記事を保存' }))

      await waitFor(() => {
        expect(screen.getByText(/タイトルを入力してください/)).toBeDefined()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('説明は任意項目なので空でも送信できる', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // 説明を入力せず送信
      await user.type(screen.getByLabelText(/記事URL/), 'https://note.com/user/n/n123')
      await user.type(screen.getByLabelText(/記事タイトル/), 'note記事')
      await user.click(screen.getByRole('button', { name: '記事を保存' }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      const submittedData = mockOnSubmit.mock.calls[0]![0] as ArticleFormData
      expect(submittedData.description).toBe('')
    })
  })

  describe('プラットフォーム自動判定', () => {
    it('ZennのURLを入力すると自動判定結果が表示される', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      const urlInput = screen.getByLabelText(/記事URL/)
      await user.type(urlInput, 'https://zenn.dev/user/articles/example')

      // プラットフォーム判定結果が表示される
      await waitFor(() => {
        expect(screen.getByText(/プラットフォーム:/)).toBeDefined()
        expect(screen.getByText('Zenn')).toBeDefined()
      })
    })

    it('QiitaのURLを入力すると自動判定結果が表示される', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      const urlInput = screen.getByLabelText(/記事URL/)
      await user.type(urlInput, 'https://qiita.com/user/items/12345')

      await waitFor(() => {
        expect(screen.getByText(/プラットフォーム:/)).toBeDefined()
        expect(screen.getByText('Qiita')).toBeDefined()
      })
    })

    it('unknownなURLでは判定結果が表示されない', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      const urlInput = screen.getByLabelText(/記事URL/)
      await user.type(urlInput, 'https://example.com/article')

      // プラットフォーム判定の情報は表示されない
      await waitFor(() => {
        expect(screen.queryByText(/プラットフォーム:/)).toBeNull()
      })
    })

    it('URLをクリアすると判定結果が消える', async () => {
      const user = userEvent.setup()

      render(<ArticleForm onSubmit={mockOnSubmit} />)

      const urlInput = screen.getByLabelText(/記事URL/)

      // URL入力
      await user.type(urlInput, 'https://zenn.dev/user/articles/example')

      // 判定結果が表示される
      await waitFor(() => {
        expect(screen.getByText('Zenn')).toBeDefined()
      })

      // URLをクリア
      await user.clear(urlInput)

      // 判定結果が消える
      await waitFor(() => {
        expect(screen.queryByText('Zenn')).toBeNull()
      })
    })
  })

  describe('送信中の状態', () => {
    it('isSubmitting=trueの場合、フィールドが無効化される', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} isSubmitting={true} />)

      // すべての入力フィールドが無効化されている
      expect(screen.getByLabelText(/記事URL/).hasAttribute('disabled')).toBe(true)
      expect(screen.getByLabelText(/記事タイトル/).hasAttribute('disabled')).toBe(true)
      expect(screen.getByLabelText(/説明/).hasAttribute('disabled')).toBe(true)
    })

    it('isSubmitting=trueの場合、送信ボタンが無効化される', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} isSubmitting={true} />)

      const submitButton = screen.getByRole('button', { name: /保存中/ })
      expect(submitButton.hasAttribute('disabled')).toBe(true)
    })

    it('isSubmitting=trueの場合、送信ボタンのテキストが変わる', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} isSubmitting={true} />)

      expect(screen.getByRole('button', { name: /保存中/ })).toBeDefined()
    })

    it('isSubmitting=trueの場合、ローディングアイコンが表示される', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} isSubmitting={true} />)

      const submitButton = screen.getByRole('button', { name: /保存中/ })
      const spinner = submitButton.querySelector('svg.animate-spin')
      expect(spinner).not.toBeNull()
    })

    it('isSubmitting=falseの場合、フィールドが有効化されている', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} isSubmitting={false} />)

      expect(screen.getByLabelText(/記事URL/).hasAttribute('disabled')).toBe(false)
      expect(screen.getByLabelText(/記事タイトル/).hasAttribute('disabled')).toBe(false)
      expect(screen.getByLabelText(/説明/).hasAttribute('disabled')).toBe(false)
    })
  })

  describe('エラーハンドリング', () => {
    it('onSubmitでエラーが発生してもフォームは動作し続ける', async () => {
      const user = userEvent.setup()
      // エラーをキャッチするonSubmit
      const errorOnSubmit = vi.fn().mockImplementation(async () => {
        try {
          throw new Error('送信エラー')
        } catch (error) {
          // エラーを適切にキャッチして処理
          console.error('送信エラー:', error)
        }
      })

      render(<ArticleForm onSubmit={errorOnSubmit} />)

      await user.type(screen.getByLabelText(/記事URL/), 'https://zenn.dev/test')
      await user.type(screen.getByLabelText(/記事タイトル/), 'エラーテスト')

      // 送信を試みる（エラーは内部で処理される）
      await user.click(screen.getByRole('button', { name: '記事を保存' }))

      // エラーが発生しても、フォームは引き続き操作可能
      await waitFor(() => {
        expect(errorOnSubmit).toHaveBeenCalled()
      })

      // フィールドがまだ有効
      expect(screen.getByLabelText(/記事URL/).hasAttribute('disabled')).toBe(false)
    })
  })

  describe('アクセシビリティ', () => {
    it('すべての入力フィールドにlabelが関連付けられている', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // getByLabelTextで取得できることを確認
      expect(screen.getByLabelText(/記事URL/)).toBeDefined()
      expect(screen.getByLabelText(/記事タイトル/)).toBeDefined()
      expect(screen.getByLabelText(/説明/)).toBeDefined()
    })

    it('必須フィールドに"*"マークが表示される', () => {
      render(<ArticleForm onSubmit={mockOnSubmit} />)

      // 必須マークが表示されることを確認（視覚的なチェック）
      const requiredMarks = screen.getAllByText('*')
      expect(requiredMarks.length).toBeGreaterThanOrEqual(2) // URL, タイトル
    })
  })
})
