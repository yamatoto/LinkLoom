# テストガイドライン

このドキュメントはUT設計・レビュー基準／AI生成時の参照を目的に、LinkLoomプロダクト向けに最小で強いテスト戦略をまとめたものです。

## 1. 価値基準（何をテストし、何を捨てるか）

### テストの目的（LinkLoom向け）

- **目標**: 致命的なデグレ（認証失敗、データ消失等）を防ぐ
- **カバレッジ数値は不問**: 80%は目安であり、絶対ではない
- **重視する領域**:
  - ✅ 認証フロー（ログイン/ログアウト）
  - ✅ データCRUD操作
  - ✅ エラーハンドリング（ネットワークエラー、認証エラー）
  - ✅ ユーザー操作による状態変化（フォーム、ボタン、画面遷移）
- **テスト不要**:
  - 型定義ファイル（`.d.ts`）
  - 定数ファイル（`const COLORS = {...}`）
  - 自明なgetter/setter

### テスト方針

- ユーザー行動に近い振る舞いを検証（DOM・副作用・遷移）。実装詳細（内部state/呼び出し回数）への依存は避ける。
  - [Testing Library - Guiding Principles](https://testing-library.com/docs/guiding-principles/?utm_source=chatgpt.com)
  - [Testing Library - React Testing Library](https://testing-library.com/docs/react-testing-library/intro/?utm_source=chatgpt.com)
  - [kentcdodds.com blog - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details?utm_source=chatgpt.com)
- 過剰カバレッジは不要：目的は信頼できる安全網であり数値ではない。実装詳細依存やスナップショット乱用はリファクタ脆弱。
  - [kentcdodds.com blog - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- E2Eは少数精鋭：主要ユーザーフローのみ（ログイン→主要画面→重要CRUD）。Playwrightのオートウェイト/ロケータを活用し、`waitForTimeout`は禁止。
  - [Playwright - Best Practices](https://playwright.dev/docs/best-practices)
  - [Playwright - Auto-waiting](https://playwright.dev/docs/actionability?utm_source=chatgpt.com)
  - [Playwright - Locator](https://playwright.dev/docs/api/class-locator?utm_source=chatgpt.com)
- Next.js App Routerの制約：一部のasync Server ComponentはUT非対応 → E2Eで担保。
  - [Next.js - Jest](https://nextjs.org/docs/app/guides/testing/jest)
  - [Next.js - Vitest](https://nextjs.org/docs/app/guides/testing/vitest?utm_source=chatgpt.com)

### MSW（Mock Service Worker）とは？

**一言で言うと**: ブラウザやNode.jsのネットワークリクエストを「途中で横取りして偽の返事を返す」ツール

**なぜ使う？**
- APIサーバーなしでフロントエンドをテストできる
- テストが高速で安定する（実際の通信なし）
- エラーケースを簡単に再現できる（401、500、タイムアウト等）

**例**:
```typescript
// MSWなし: 実際にSupabaseへHTTPリクエスト → 遅い、不安定
// MSWあり: 「/api/projects へのGETには [{id:1, name:'test'}] を返す」と設定
//          → 高速、安定、エラーも自由に再現
```

**セットアップ**: tests/mocks/server.ts で設定
  - [Mock Service Worker - Introduction](https://mswjs.io/docs/)
  - [Mock Service Worker - FAQ](https://mswjs.io/docs/faq/?utm_source=chatgpt.com)

**現在の状態**: LinkLoomではまだ未使用。将来的にAPI連携テストで必要になる。

---

## 2. テストのレイヤと配分（推奨ピラミッド）

- ユニット/コンポーネント（Vitest + RTL）：多数
  - ロジック・フォーム・バリデーション・状態遷移・副作用（トースト/ナビゲーション引数）
- 統合（軽量結合）：適量
  - Query/StoreとUIの接続、APIエラー分岐の代表値
  - 将来的にMSW導入予定
- E2E（Playwright）：最小
  - サインイン/サインアウト、最重要画面の幸せ経路＋代表的なエラー1つ

---

## 3. 「良いUT」の条件（チェックリスト）

- 観測可能な結果にアサート（表示テキスト、属性、ルーティング、API呼び出しパラメータ）。内部実装は見ない。
  - [Testing Library - React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- 代表ケース主義：分岐はユーザー影響が変わる代表のみ（全パターン羅列はしない）。
- 疎モック：UI直下の外部依存だけをモック（router・logger等）。`vi.spyOn`は観測に、`vi.mock`は置換に使い分け。
  - [Vitest - Mocking](https://vitest.dev/guide/mocking)
  - [Vitest - Mock Functions](https://vitest.dev/api/mock?utm_source=chatgpt.com)
  - [DEV Community - Mock vs. SpyOn in Vitest](https://dev.to/axsh/mock-vs-spyon-in-vitest-with-typescript-a-guide-for-unit-and-integration-tests-2ge6?utm_source=chatgpt.com)
- 非同期は`waitFor`/`findBy`で安定化。手動sleep禁止。
  - [Testing Library - React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- テスト名は振る舞いを日本語で（仕様の意図が読める）。
- 1テスト1関心：セットアップ簡潔、期待値明確。
- リファクタ耐性：データの固定文字列に依存しすぎない（`getByRole`などアクセシビリティファースト）。
  - [Testing Library - React Testing Library](https://testing-library.com/docs/react-testing-library/intro/?utm_source=chatgpt.com)

---

## 4. スタック別の実践パターン

- React + RTL 基本方針
  - `@testing-library/react`でユーザー操作は`user-event`、クエリは`getByRole`/`findByText`中心。実装詳細を避ける。
    - [Testing Library - React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- TanStack Query（React Query）
  - QueryClientをテスト用に作成（`retry: false`、短い`staleTime`、ログ抑制）。
  - ネット呼び出しはMSWで制御（成功/4xx/5xx/タイムアウト代表）。
    - [TanStack - Testing](https://tanstack.com/query/v4/docs/framework/react/guides/testing)
- Zustand
  - コンポーネントはそのままRTLで。ストアの初期状態注入ヘルパを用意すると読みやすい（型安全にプリセット）。
    - [Zustand - Testing](https://zustand.docs.pmnd.rs/guides/testing)
    - [medium - An Essential Zustand Test Recipe](https://medium.com/%40tts2p4/an-essential-zustand-test-recipe-43e5892d75cb)
- フォーム（React Hook Form + Zod）
  - バリデーションスキーマは単体で（Zodの`safeParse`で境界値）。
  - UIは代表入力＋エラーメッセージの出方を確認（全フィールド網羅は不要）。
- Supabase（Auth/DB）
  - UT：`signInWithOAuth`は呼び出し引数（`redirectTo` 等）とエラー分岐を検証。`onAuthStateChange`はコールバックを手動発火。実リダイレクト/セッション維持はE2Eへ。
    - [Supabase- Sign in a user through OAuth](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)
    - [Supabase- Listen to auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
  - E2E：ログイン→主要画面をPlaywrightで。テストデータの生成/破棄はMSW or 専用ハーネスで管理（例：Supabase向けハーネスの考え方）。
    - [Medium - Supabase E2E Testing Made Easy With Supawright](https://medium.isaacharrisholt.com/supabase-e2e-testing-made-easy-with-supawright-98bb94ae4bb0)
- Next.js 15（App Router）
  - Vitestガイドに沿って設定。async Server ComponentはUT非対応 → E2E。
    - [Next.js - Vitest](https://nextjs.org/docs/app/guides/testing/vitest)
    - [Next.js - Jest](https://nextjs.org/docs/app/guides/testing/jest?utm_source=chatgpt.com)

---

## 5. モック戦略（最小で強く・読みやすく）

- 原則：外部依存は`vi.spyOn`/`vi.mock`で必要最小限。HTTPは将来的にMSW導入予定。
- 使い分け
  - spy（監視）：挙動を変えず"呼ばれた/引数"を観測（例：`router.push`、`toast.error`）。
    - [Vitest - Mock Functions](https://vitest.dev/api/mock)
  - mock（置換）：外部依存の重い/不安定箇所を代替（例：`supabase.auth.signInWithOAuth`）。
    - [Vitest - Mocking](https://vitest.dev/guide/mocking)
  - MSW（将来）：API応答を現実に近い形で用意（成功・認可エラー・サーバーエラーの代表）。ハンドラは開発・UT・E2Eで再利用。
    - [Mock Service Worker - Introduction](https://mswjs.io/docs/)
    - [Mock Service Worker - Intercepting requests](https://mswjs.io/docs/http/intercepting-requests/?utm_source=chatgpt.com)
- アンチパターン
  - fetchを手作りで差し替える／全関数をモックしてUIが空打ちになる
  - wait/sleep多用（Playwrightではオートウェイト＋ロケータを使う）
    - [Playwright - Auto-waiting](https://playwright.dev/docs/actionability)
    - [Playwright - Locator](https://playwright.dev/docs/api/class-locator?utm_source=chatgpt.com)

---

## 6. Playwright（E2E）運用ルール

- ロケータ中心（`getByRole`/`getByLabel`/`getByTestId`）。ハードウェイト禁止。失敗時はトレースを有効化。
  - [Playwright - Locator](https://playwright.dev/docs/api/class-locator?utm_source=chatgpt.com)
  - [Playwright - Auto-waiting](https://playwright.dev/docs/actionability)

- テスト独立性：各テストは新規コンテキストで実行（state汚染回避）。Playwrightベストプラクティスに準拠。
  - [Playwright - Best Practices](https://playwright.dev/docs/best-practices?utm_source=chatgpt.com)

### E2E認証テスト戦略（LinkLoom実装）

**採用アプローチ**: Playwright公式推奨の`storageState`パターン + **実際のGoogle OAuth認証**

**仕組み**:
1. **Global Setup**（`tests/e2e/global-setup.ts`）
   - 実際のGoogle OAuth認証フローを1回実行
   - テスト専用Googleアカウントでログイン
   - 認証状態を`.auth/authenticated.json`に保存
   - 全テストでこの認証状態を再利用

2. **playwright.config.ts**
   - globalSetupを登録
   - デフォルトのstorageStateを設定
   - 各テストは自動的に認証済み状態で開始

3. **フィクスチャ**（`tests/e2e/fixtures/auth.fixture.ts`）
   - `authenticatedPage`: デフォルトのstorageStateを使用（認証済み）
   - `unauthenticatedPage`: storageStateをクリアした新しいコンテキストを作成（未認証）

**メリット**:
- ✅ テストが高速（認証は1回のみ）
- ✅ 実際のブラウザ認証を使うため100%互換性
- ✅ Supabase SSRの内部実装に依存しない
- ✅ 保守が容易（モックロジック不要）
- ✅ middlewareとの完全な互換性
- ✅ プロダクションと完全に同じ認証フロー

#### テスト用Googleアカウントのセットアップ

**前提条件**: Supabaseプロジェクトで既にGoogle OAuth認証が設定済みであること

**手順**:

1. **テスト専用Googleアカウントを作成**
   ```
   例: linkloom-e2e-test@gmail.com
   ```
   - 新しいGoogleアカウントを作成（既存アカウントの使用は非推奨）
   - セキュリティ: 2段階認証は無効にする（E2Eテスト用）
   - パスワードは強固なものを使用（推奨: 16文字以上のランダム文字列）

2. **Supabaseにテストユーザーを登録**
   - 開発環境で一度手動ログインしてSupabaseにユーザーを登録
   - または、Supabase Dashboard > Authentication > Users から手動で追加

3. **環境変数を設定**（`.env.local`）
   ```bash
   # Playwright E2Eテスト用認証情報
   PLAYWRIGHT_TEST_GOOGLE_EMAIL=linkloom-e2e-test@gmail.com
   PLAYWRIGHT_TEST_GOOGLE_PASSWORD=your-strong-password-here
   ```

4. **動作確認**
   ```bash
   # E2Eテスト実行（初回は認証フローが実行される）
   npm run test:e2e
   ```

5. **認証状態の確認**
   - `tests/e2e/.auth/authenticated.json` ファイルが作成される
   - このファイルには認証Cookie情報が保存される
   - Git管理対象外（`.gitignore`に追加済み）

**トラブルシューティング**:

- **認証失敗（"認証情報が設定されていません"）**: `.env.local`に環境変数を正しく設定してください
- **Google認証画面でブロック**: Googleアカウントの2段階認証を無効にしてください
- **セッション期限切れ**: `.auth/authenticated.json`を削除して再度テストを実行してください
- **CI/CD環境**: GitHub Actions等ではシークレット環境変数に設定してください

**セキュリティ注意事項**:

- ⚠️ テスト用Googleアカウントのパスワードは `.env.local` に記載（Gitにコミットしない）
- ⚠️ `.env.local` は `.gitignore` に追加されていることを確認
- ⚠️ テストアカウントは本番データにアクセスできないように設定
- ⚠️ CI/CD環境ではGitHub Secretsなどセキュアな方法で管理

**参考資料**:
- [Playwright - Authentication](https://playwright.dev/docs/auth)
- [Playwright - Global Setup](https://playwright.dev/docs/test-global-setup-teardown)
- [Playwright - Best Practices](https://playwright.dev/docs/best-practices)

### Flaky Test（不安定なテスト）対応

**Flaky Testとは**: 実行するたびに成功したり失敗したりするテスト

**対応方針**:
1. **再現したら即修正**（48時間以内）
   - 原因特定 → `waitFor`の調整、モックの修正等
2. **再現しない場合は削除**
   - テストが複雑すぎる可能性 → シンプルに書き直すor削除
3. **原因不明なら一時スキップ**
   - `it.skip('テスト名', ...)` でスキップ
   - GitHubのissueを作成して追跡
   - **放置は禁止**（技術的負債化を防ぐ）

---

## 7. 最小セットアップ例（抜粋）

- Vitest 設定（vitest.config.ts）
  - `jsdom`環境、`setupFiles`で初期化、`vi.restoreAllMocks()` を`afterEach`で。
    - [Vitest - Configuring Vitest](http://vitest.dev/config/?utm_source=chatgpt.com)

- React Test Utils
  - `renderWithProviders`を用意：`QueryClientProvider`（`retry:false`など）＋Zustand初期化＋`Theme/Toaster`などUI基盤。
    - [TanStack - Testing](https://tanstack.com/query/v4/docs/framework/react/guides/testing?utm_source=chatgpt.com)

---

## 8. レビュー観点（Pull Request チェックリスト）

- ユーザー視点で結果を検証している（役割/ラベル/可視テキスト）。
  - [Testing Library - React Testing Library](https://testing-library.com/docs/react-testing-library/intro/?utm_source=chatgpt.com)
- 代表ケースに絞れている（分岐の"意味のある差"のみ）。
- 不要な関数モックをしていない。
- 非同期安定化は`waitFor`/`findBy*`（sleep無し）。
- ロケータ適切（Playwrightで`getByRole`等）。
  - [Playwright - Locator](https://playwright.dev/docs/api/class-locator?utm_source=chatgpt.com)
- Next.js App Routerの非対応領域はE2Eに回している。
  - [Next.js - Vitest](https://nextjs.org/docs/app/guides/testing/vitest?utm_source=chatgpt.com)
- テスト名が仕様の意図を説明している。
- 過剰なスナップショットや内部実装アサートがない。
  - [kentcdodds.com blog - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details?utm_source=chatgpt.com)

---

## 9. 完全なコード例（実際のLinkLoomプロジェクトから）

以下は実際にLinkLoomプロジェクトで使用されているテストコードです。Claude Codeがテスト生成する際の「お手本」として参照してください。

### 例1: コンポーネントテスト - GoogleLoginButton

**何をテストしているか**:
- ボタンのレンダリング（表示、スタイル、アイコン）
- クリック時の動作（ローディング状態、認証呼び出し）
- 各種エラーケースの表示（キャンセル、ネットワークエラー、サーバーエラー）
- エラー後のリカバリー（ボタン再有効化）

**完全なコード**:
```typescript
// tests/unit/components/GoogleLoginButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { createMockAuthError } from '../../mocks/supabase'
import { toast } from 'sonner'

// 外部依存をモック化
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const mockSignInWithGoogle = vi.fn()
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    user: null,
    loading: false,
    signOut: vi.fn(),
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks() // 各テスト前にモックをリセット
  })

  describe('レンダリング', () => {
    it('正しくボタンが表示される', () => {
      // Given: コンポーネントをレンダリング
      render(<GoogleLoginButton />)

      // Then: ボタンが有効な状態で表示される
      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      expect(button).toBeDefined()
      expect(button.hasAttribute('disabled')).toBe(false)
    })

    it('Googleアイコンが表示される', () => {
      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      const svg = button.querySelector('svg')
      expect(svg).not.toBeNull()
    })
  })

  describe('クリック動作', () => {
    it('クリック時にsignInWithGoogleが呼び出される', async () => {
      // Given: 認証成功をモック
      mockSignInWithGoogle.mockResolvedValue({ error: null })

      render(<GoogleLoginButton />)

      // When: ボタンをクリック
      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      // Then: 認証関数が呼ばれる
      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
      })
    })

    it('ローディング中はボタンが無効化される', async () => {
      // Given: 遅延する認証処理をモック
      mockSignInWithGoogle.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ error: null }), 100)
          })
      )

      render(<GoogleLoginButton />)

      // When: ボタンをクリック
      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      // Then: ローディング中はボタンが無効化され、テキストが変わる
      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(true)
        expect(screen.getByText('認証中...')).toBeDefined()
      })
    })
  })

  describe('エラーハンドリング', () => {
    it('Google認証キャンセル時、適切なエラーメッセージが表示される', async () => {
      // Given: キャンセルエラーをモック
      const error = createMockAuthError('popup_closed', 400)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      // When: ボタンをクリック
      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      // Then: エラートーストが表示される
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
        const mockCalls = (toast.error as unknown as { mock: { calls: unknown[][] } }).mock.calls
        expect(mockCalls[0]?.[0]).toBeDefined()
        const callArg = mockCalls[0]![0] as string
        expect(callArg).toContain('認証がキャンセルされました')
      })
    })

    it('ネットワークエラー時、適切なエラーメッセージが表示される', async () => {
      const error = createMockAuthError('network error', 0)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
        const mockCalls = (toast.error as unknown as { mock: { calls: unknown[][] } }).mock.calls
        const callArg = mockCalls[0]![0] as string
        expect(callArg).toContain('ネットワークエラー')
      })
    })

    it('エラー後、ボタンが再度有効化される', async () => {
      // Given: エラーをモック
      const error = createMockAuthError('Auth failed', 400)
      mockSignInWithGoogle.mockResolvedValue({ error })

      render(<GoogleLoginButton />)

      // When: ボタンをクリック
      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      // Then: エラー後にボタンが再度有効化される
      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(false)
      })
    })
  })

  describe('成功時の動作', () => {
    it('エラーがない場合、トースト通知は表示されない', async () => {
      // Given: 認証成功をモック
      mockSignInWithGoogle.mockResolvedValue({ error: null })

      render(<GoogleLoginButton />)

      // When: ボタンをクリック
      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      fireEvent.click(button)

      // Then: 成功時はエラートーストが表示されない
      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled()
      })

      expect(toast.error).not.toHaveBeenCalled()
    })
  })
})
```

**ポイント**:
- ✅ `vi.mock()`: 外部依存（toast、useAuth、logger）を偽物に置き換え
- ✅ `mockResolvedValue()`: 非同期関数の返り値を制御
- ✅ `mockImplementation()`: 遅延処理など複雑な動作をモック
- ✅ `waitFor()`: 非同期処理の完了を待つ
- ✅ `fireEvent.click()`: ユーザーのクリック操作を再現
- ✅ `describe`で機能ごとにグループ化
- ✅ テスト名は「何をテストするか」が明確

---

### 例2: カスタムフックのテスト - useAuth

**何をテストしているか**:
- フックの初期化とloading状態の管理
- signInWithGoogle / signOut の呼び出しと引数
- エラーハンドリング
- onAuthStateChange のライフサイクル管理

**完全なコード**:
```typescript
// tests/unit/hooks/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { mockUser, mockSession, createMockAuthError } from '../../mocks/supabase'

// Next.js routerのモック
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Server Actionのモック
vi.mock('@/app/actions/auth', () => ({
  getDevAuthUser: vi.fn().mockResolvedValue(null),
}))

// Supabaseクライアントをモック
const mockGetSession = vi.fn()
const mockSignInWithOAuth = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// テスト対象をインポート（モックの後に）
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルトのモック戻り値を設定
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    mockSignInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
      error: null,
    })

    mockSignOut.mockResolvedValue({
      error: null,
    })

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })
  })

  describe('初期化', () => {
    it('初期状態ではloadingがtrueでuserがnull', async () => {
      // Given: フックをレンダリング
      const { result } = renderHook(() => useAuth())

      // Then: 初期状態を確認
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
    })

    it('セッション取得後、loadingがfalseになる', async () => {
      const { result } = renderHook(() => useAuth())

      // When: セッション取得完了を待つ
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Then: getSessionが呼ばれている
      expect(mockGetSession).toHaveBeenCalled()
    })

    it('セッションが存在する場合、userが設定される', async () => {
      // Given: セッション有りをモック
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      // When: セッション取得完了を待つ
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.loading).toBe(false)
      })
    })

    it('セッション取得エラー時、userはnullでloadingはfalse', async () => {
      // Given: エラーをモック
      const error = createMockAuthError('Session retrieval failed', 500)
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error,
      })

      const { result } = renderHook(() => useAuth())

      // When: エラー処理完了を待つ
      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('signInWithGoogle', () => {
    it('Supabase signInWithOAuthが正しく呼び出される', async () => {
      const { result } = renderHook(() => useAuth())

      // Given: 初期化完了を待つ
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // When: signInWithGoogleを実行
      const response = await result.current.signInWithGoogle()

      // Then: 正しいパラメータで呼ばれる
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('http://localhost:3000'),
        },
      })
      expect(response.error).toBeNull()
    })

    it('エラー時、errorオブジェクトが返される', async () => {
      // Given: エラーをモック
      const authError = createMockAuthError('OAuth failed', 400)
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: null },
        error: authError,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // When: signInWithGoogleを実行
      const response = await result.current.signInWithGoogle()

      // Then: エラーが返される
      expect(response.error).toEqual(authError)
    })
  })

  describe('signOut', () => {
    it('Supabase signOutが正しく呼び出される', async () => {
      // Given: ログイン状態をモック
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // When: signOutを実行
      const response = await result.current.signOut()

      // Then: signOutが呼ばれる
      expect(mockSignOut).toHaveBeenCalled()
      expect(response.error).toBeNull()
    })

    it('エラー時、errorオブジェクトが返される', async () => {
      // Given: エラーをモック
      const authError = createMockAuthError('Sign out failed', 500)
      mockSignOut.mockResolvedValue({
        error: authError,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // When: signOutを実行
      const response = await result.current.signOut()

      // Then: エラーが返される
      expect(response.error).toEqual(authError)
    })
  })

  describe('onAuthStateChange', () => {
    it('onAuthStateChangeが登録される', async () => {
      // When: フックをレンダリング
      renderHook(() => useAuth())

      // Then: onAuthStateChangeが呼ばれる
      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })

    it('unmount時にsubscriptionがunsubscribeされる', async () => {
      // Given: unsubscribeをモック
      const unsubscribeMock = vi.fn()
      mockOnAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: unsubscribeMock,
          },
        },
      })

      const { unmount } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })

      // When: フックをアンマウント
      unmount()

      // Then: unsubscribeが呼ばれる
      expect(unsubscribeMock).toHaveBeenCalled()
    })
  })
})
```

**ポイント**:
- ✅ `renderHook()`: カスタムフックをテスト用にレンダリング
- ✅ `result.current`: フックの現在の状態・関数にアクセス
- ✅ `waitFor()`: 非同期のstate更新を待つ
- ✅ `beforeEach`でモックをリセット（テスト独立性）
- ✅ エラーケースも同じパターンで網羅的にテスト
- ✅ ライフサイクル（mount/unmount）もテスト

---

## 10. 参考リンク

- React Testing Library：指針とAPI（実装詳細を避ける）
  - [Testing Library - Guiding Principles](https://testing-library.com/docs/guiding-principles/?utm_source=chatgpt.com)
  - [Testing Library - React Testing Library](https://testing-library.com/docs/react-testing-library/intro/?utm_source=chatgpt.com)
  - [Testing Library - API](https://testing-library.com/docs/react-testing-library/api/?utm_source=chatgpt.com)
- Vitest：モック/spy/API・設定
  - [Vitest - Mocking](https://vitest.dev/guide/mocking?utm_source=chatgpt.com)
  - [Vitest - Mock Functions](https://vitest.dev/api/mock?utm_source=chatgpt.com)
  - [Vitest - Configuring Vitest](https://vitest.dev/config/?utm_source=chatgpt.com)
- Playwright：ベストプラクティス／オートウェイト／ロケータ。
  - [Playwright - Best Practices](https://playwright.dev/docs/best-practices?utm_source=chatgpt.com)
  - [Playwright - Auto-waiting](https://playwright.dev/docs/actionability?utm_source=chatgpt.com)
  - [Playwright - Locator](https://playwright.dev/docs/api/class-locator?utm_source=chatgpt.com)
- MSW：導入と思想（ネットワーク層モック）
  - [Mock Service Worker - Introduction](https://mswjs.io/docs/?utm_source=chatgpt.com)
  - [Mock Service Worker - Quick start](https://mswjs.io/docs/quick-start/?utm_source=chatgpt.com)
- TanStack Query：テストガイド
  - [TanStack - Testing](https://tanstack.com/query/v4/docs/react/guides/testing?utm_source=chatgpt.com)
- Zustand：テストガイド
  - [Zustand - Testing](https://zustand.docs.pmnd.rs/guides/testing?utm_source=chatgpt.com)
- Next.js App Router × Vitest：ガイドと制約
  - [Next.js - Vitest](https://nextjs.org/docs/app/guides/testing/vitest?utm_source=chatgpt.com)
  - [Next.js - Jest](https://nextjs.org/docs/app/guides/testing/jest?utm_source=chatgpt.com)
- Supabase：`signInWithOAuth`／`onAuthStateChange`。
  - [Supabase - Sign in a user through OAuth](https://supabase.com/docs/reference/javascript/auth-signinwithoauth?utm_source=chatgpt.com)
  - [Supabase - Listen to auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
