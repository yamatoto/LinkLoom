---
name: Multi-Expert Code Review
description: Perform comprehensive code reviews from multiple expert perspectives in parallel. Use when reviewing code implementations, checking code quality, or after AI implementations. Reviews architecture compliance, security, performance, testing best practices, and modern TypeScript/JavaScript patterns.
allowed-tools: Read, Grep, Glob, Bash
---

# Multi-Expert Code Review

このスキルは、5人の専門家の視点から並列でコードレビューを実施します。AI実装後やレビュー依頼前に、包括的な品質チェックを自動化します。

## このスキルができること

1. **Architecture Expert**: Next.js App Routerアーキテクチャパターン準拠チェック
2. **Security Expert**: セキュリティ脆弱性の検出と修正提案（Google OAuth、Supabase Auth）
3. **Performance Expert**: パフォーマンスの問題とボトルネックの特定（React Query、Client Components）
4. **Testing Expert**: テスト構造とベストプラクティスの検証（Vitest、Playwright、RTL）
5. **Modern TS/React Expert**: TypeScript/React/Next.jsの記述チェック

これらの専門家視点を**並列実行**し、総合的なレビューレポートを生成します。

**対象技術スタック（LinkLoom）**:

- **Frontend**: Next.js 15 (App Router)、React、TailwindCSS
- **State**: TanStack Query、Zustand
- **Auth**: Supabase Auth (Google OAuth)、@supabase/ssr
- **Testing**: Vitest、Playwright、React Testing Library
- **Quality**: ESLint、TypeScript strict mode
- **Database**: Supabase（PostgreSQL）

## 5人の専門家の視点

### 1. Architecture Expert（アーキテクチャ専門家）

**レビュー観点:**

- Next.js App Routerの構造とベストプラクティス遵守
- Server Component / Client Componentの適切な使い分け
- ディレクトリ構造の一貫性（app/ src/ components/ hooks/ lib/）
- 状態管理の適切性（Zustand、React Query）
- コンポーネントの責務と粒度
- コードの重複（DRY原則）
- 命名規則の一貫性

**チェック項目:**

- [ ] Server Componentでクライアントコードをインポートしていないか
- [ ] 'use client'ディレクティブが適切に使われているか
- [ ] データフェッチがServer Component/React Queryで適切に実装されているか
- [ ] コンポーネントが適切な粒度に分割されているか
- [ ] hooks/の下にカスタムフックが適切に配置されているか
- [ ] lib/の下にユーティリティ関数が適切に配置されているか
- [ ] 循環依存が発生していないか

**参照ファイル:**

- [ARCHITECTURE.md](ARCHITECTURE.md)

### 2. Security Expert（セキュリティ専門家）

**レビュー観点:**

- Supabase Auth (Google OAuth)の適切な実装
- XSS（クロスサイトスクリプティング）対策
- 認証・認可の適切な実装（middleware.ts）
- 機密情報の扱い（ログ出力、エラーメッセージ）
- 入力値のバリデーション（Zod）
- CORS設定
- 環境変数の適切な使用（NEXT*PUBLIC* プレフィックス）

**チェック項目:**

- [ ] Supabase Clientが適切に使用されているか（@supabase/ssr）
- [ ] 認証状態の確認が適切に実装されているか（middleware.ts）
- [ ] パスワードやトークンがハードコードされていないか
- [ ] エラーメッセージに機密情報が含まれていないか
- [ ] Zodでバリデーションが適切に実装されているか
- [ ] NEXT*PUBLIC*プレフィックスが適切に使われているか
- [ ] 環境変数（`process.env`）の使用が適切か

**危険なパターン:**

- `eval()`, `Function()` の使用
- `dangerouslySetInnerHTML` の不適切な使用
- 機密情報のログ出力
- 認証バイパスの実装（DEV_AUTH_BYPASSなど）

### 3. Performance Expert（パフォーマンス専門家）

**レビュー観点:**

- React Queryのキャッシュ活用
- 不要な再レンダリング
- Client Componentの過剰な使用
- 非効率なループ処理
- 大量データの扱い
- 画像最適化（Next.js Image）
- 非同期処理の適切な使用

**チェック項目:**

- [ ] React QueryのstaleTime/cacheTimeが適切に設定されているか
- [ ] 不要な'use client'がないか（Server Componentを優先）
- [ ] useMemo/useCallbackが適切に使われているか
- [ ] 不要な`await`が並列化を妨げていないか
- [ ] Next.js Imageコンポーネントが使われているか
- [ ] dynamic importが適切に使われているか
- [ ] ループ内でのコンポーネント生成が最適化されているか

**最適化例:**

```typescript
// ❌ Client Componentで不要にuseEffectを使う
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => { fetchData().then(setData) }, [])
  return <div>{data?.title}</div>
}

// ✅ Server Componentでフェッチ
export default async function Page() {
  const data = await fetchData()
  return <div>{data.title}</div>
}

// ❌ 逐次実行
const data1 = await fetchData1();
const data2 = await fetchData2();

// ✅ 並列実行
const [data1, data2] = await Promise.all([
  fetchData1(),
  fetchData2()
]);
```

**参照ファイル:**

- [PERFORMANCE.md](PERFORMANCE.md)

### 4. Testing Expert（テスト専門家）

**レビュー観点:**

- tests/README.mdのガイドライン遵守
- テストの網羅性（主要フロー重視）
- モック戦略（vi.spyOn / vi.mock の使い分け）
- React Testing Libraryのベストプラクティス
- Playwrightのベストプラクティス（auto-waiting、locator）
- エッジケースのカバー

**チェック項目:**

- [ ] 主要ユーザーフロー（認証、CRUD）がテストされているか
- [ ] getByRole/findByTextなどアクセシビリティファーストのクエリを使用しているか
- [ ] `waitFor`/`findBy`で非同期処理を適切に待機しているか
- [ ] vi.spyOn（監視）とvi.mock（置換）が適切に使い分けられているか
- [ ] 実装詳細（内部state、呼び出し回数）に依存していないか
- [ ] Playwrightでハードウェイト（waitForTimeout）を使っていないか
- [ ] テストが独立しているか（state汚染なし）

**このプロジェクトのテストパターン:**

```typescript
// ✅ RTL + user-event
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

test('ボタンクリック時にログイン処理が呼ばれる', async () => {
  const mockSignIn = vi.fn()
  render(<LoginButton onSignIn={mockSignIn} />)

  const button = screen.getByRole('button', { name: /ログイン/i })
  await userEvent.click(button)

  await waitFor(() => {
    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })
})

// ✅ Playwright with locator
test('ログインボタンクリックで認証プロセス開始', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: /Googleでログイン/i })
  await button.click()
  await page.waitForURL(/accounts\.google\.com/)
})
```

**ベストプラクティス:**

- ユーザー行動に近い検証（DOM・副作用・遷移）
- tests/README.mdの「良いUT」条件遵守
- 過剰カバレッジ不要（80%は目安）

### 5. Modern TS/React Expert（モダンTS/React専門家）

**レビュー観点:**

- TypeScript strict modeの遵守
- React/Next.js 15のベストプラクティス
- 非推奨APIの使用
- ESLintルールの遵守
- Reactフックの適切な使用
- 適切な型定義

**チェック項目:**

- [ ] `any`型の使用が最小限か（やむを得ない場合のみ）
- [ ] React Server Componentsの型定義が適切か
- [ ] Optional Chaining (`?.`)、Nullish Coalescing (`??`)が活用されているか
- [ ] useEffectの依存配列が適切か
- [ ] カスタムフックが適切に抽出されているか
- [ ] Reactのキー（key prop）が適切に設定されているか
- [ ] `var`ではなく`const`/`let`が使われているか

**モダンな書き方:**

```typescript
// ❌ Client Componentで不要な状態管理
'use client'
export default function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
  return <div>{user?.name ?? 'Loading...'}</div>
}

// ✅ React Queryを活用
'use client'
export default function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })
  return <div>{user?.name ?? 'Loading...'}</div>
}

// ❌ any型の乱用
const data: any = await fetchData();

// ✅ 適切な型定義
const data: FetchDataResponse = await fetchData();

// ❌ useEffectの依存配列エラー
useEffect(() => {
  fetchData()
}, []) // fetchDataが依存配列にない

// ✅ 適切な依存配列
useEffect(() => {
  fetchData()
}, [fetchData]) // または useCallbackで定義
```

**型安全性のチェック:**

- TypeScript strict modeに準拠しているか
- 型アサーション（`as`）が必要最小限か
- Reactコンポーネントの型定義が適切か（FC<Props>よりもfunction Component(props: Props)を推奨）

## レビューの実施方法

### 1. レビュー対象の特定

レビュー対象を明確にします：

- 特定のファイル（例: `src/hooks/useAuth.ts`）
- ディレクトリ全体（例: `src/components/auth/`）
- 最近の変更（git diff）

### 2. 並列レビューの実行

5人の専門家が**並列**に以下を実行します：

```bash
# 変更内容の確認
git diff --staged
git diff main...HEAD

# ファイルの確認
cat src/hooks/useAuth.ts

# パターン検索（セキュリティリスクなど）
grep -r "eval(" src/
grep -r "process.env" src/
```

各専門家は独立してレビューを実施し、それぞれの観点からフィードバックを提供します。

### 3. レビューレポートの生成

レビュー結果を以下の形式で集約します：

```markdown
# Code Review Report

## 対象

- Directory: `src/hooks/`
- Files: `useAuth.ts`, `useProjects.ts`

## Architecture Review

- ✅ カスタムフックが適切に分離されている
- ⚠️ useAuthにビジネスロジックが混在
- 💡 提案: ビジネスロジックをservices/auth.tsに移動

## Security Review

- ✅ Supabase Authが適切に使用されている
- ❌ ログアウト時のリダイレクト先がハードコード（line 42）
- 🔴 Critical: 環境変数に移動

## Performance Review

- ✅ React Queryのキャッシュが適切
- ⚠️ ループ内の非同期処理が逐次実行（line 67）
- 💡 提案: Promise.allで並列化

## Testing Review

- ✅ 主要ケースはカバー
- ⚠️ エッジケース（null, undefined）のテストが不足
- 💡 提案: エッジケーステストを追加（tests/README.md参照）

## Modern JS/TS Review

- ✅ TypeScript型定義が適切
- ⚠️ any型の使用（line 23）
- 💡 提案: 適切な型定義を作成

## 総合評価

- Critical Issues: 1
- Warnings: 4
- Suggestions: 5

## 優先順位の高い対応

1. [Critical] リダイレクト先を環境変数に移動
2. [Warning] ビジネスロジックをhooksから分離
3. [Warning] 非同期処理の並列化
```

## 使用例

### 例1: AI実装後の自動レビュー

```
ユーザー: このコードをレビューしてください
```

スキルが自動的に：

1. 5人の専門家視点でコードを並列レビュー
2. 各観点からのフィードバックを集約
3. 優先順位付きのレビューレポートを生成

### 例2: 特定ディレクトリのレビュー

```
ユーザー: src/components/auth/ のコードをレビューしてください
```

スキルが自動的に：

1. ディレクトリ構造を分析
2. 主要ファイルを特定
3. 5人の専門家視点で並列レビュー

### 例3: 最近の変更のレビュー

```
ユーザー: 最近の変更をレビューしてください
```

スキルが自動的に：

1. `git diff`で変更を確認
2. 変更されたファイルをレビュー
3. レビューレポート生成

## 設定とカスタマイズ

### プロジェクト固有のルール追加

プロジェクト固有のレビュー観点は、以下のファイルで定義できます：

- `ARCHITECTURE.md`: アーキテクチャガイドライン
- `SECURITY.md`: セキュリティガイドライン
- `PERFORMANCE.md`: パフォーマンスガイドライン
- `TESTING.md`: テストガイドライン
- `TYPESCRIPT.md`: TypeScript/JavaScriptガイドライン

これらのファイルがある場合、各専門家はそれを参照してレビューします。

### 専門家の有効/無効化

特定の観点のみレビューしたい場合：

```
ユーザー: セキュリティとパフォーマンスの観点だけでレビューしてください
```

### レビューの深さ調整

```
ユーザー: 簡易レビューをお願いします（Critical Issuesのみ）
ユーザー: 詳細レビューをお願いします（Suggestionsも含む）
```

## ベストプラクティス

### レビューのタイミング

1. **AI実装直後**: AI実装後は必ずこのスキルでレビュー
2. **PR作成前**: レビュー依頼前にセルフチェック
3. **大規模変更後**: 複数ファイルにまたがる変更の後

### レビュー結果の活用

1. **Critical Issues**: 即座に修正（マージブロック）
2. **Warnings**: 次のコミットで修正
3. **Suggestions**: 可能であれば反映（時間があれば）

### チームでの活用

- レビューレポートをPR説明に添付
- チーム共通の観点で品質を担保
- レビュアーの負担を軽減

## トラブルシューティング

### レビューが開始されない

- ファイルパスが正しいか確認
- レビュー対象が明確か確認（「このコードをレビュー」ではなく「src/hooks/useAuth.tsをレビュー」）

### 誤検知が多い

- プロジェクト固有のガイドライン（ARCHITECTURE.mdなど）を作成
- レビュー観点を明示（「セキュリティの観点でレビュー」）

### レビューが遅い

- レビュー対象を絞る（ファイル単位、パッケージ単位）
- 簡易レビューモードを使用

## 関連スキル

- **Code Review Prep**: レビュー前の自動チェック（型チェック、Lint、テスト）
- **Git Auto Commit & PR**: レビュー後のコミット・PR作成

## 参考資料

- [CLAUDE.md](../../CLAUDE.md): プロジェクトのClaude活用ガイドライン
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
