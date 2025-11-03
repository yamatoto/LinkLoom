# LinkLoom 開発計画と進捗

**最終更新**: 2025-11-03 (Phase 1 MVP: 100%完了)

> **📝 進捗更新ルール（Claude Code向け）**:
> タスク完了時は必ずユーザーに確認を取り、許可後にこのファイルを更新してください。
> 詳細は [CLAUDE.md](../CLAUDE.md) の「実装ワークフロー」を参照。

---

## 📖 プロジェクト概要

技術記事を効率的に保存・検索・管理するパーソナル知識管理システム。note、Qiita、Zennなど複数のプラットフォームの記事を一元管理し、タグで分類、キーワード検索で素早くアクセスできる。

### 解決する課題

- 気になった技術記事を後で見つけられない
- 複数のプラットフォーム（note, Qiita, Zenn等）に記事が散在
- 記事の分類・整理ができない
- 学習進捗や理解度の管理ができない

---

## 📊 現在の進捗状況

### Phase 1 MVP進捗

```
認証・同期   ████████████████████ 100% ✅
記事登録     ████████████████████ 100% ✅
記事一覧表示 ████████████████████ 100% ✅
検索機能     ████████████████████ 100% ✅
編集・削除   ████████████████████ 100% ✅

全体進捗:    ████████████████████ 100%
```

### 総テスト数

- **184テスト** すべて合格
  - 認証: 26テスト（UT 26 + E2E 3）
  - 記事登録: 69テスト（統合10 + UT 53 + E2E 6）
  - 記事一覧: 26テスト（統合8 + UT 12 + E2E 6）
  - 検索機能: 60テスト（統合14 + UT 33 + E2E 13）
  - 編集・削除: 23テスト（統合11 + UT 4 + E2E 2）
- **静的解析**: Lint/TypeScript エラー0件

---

## 🎯 Phase 1: MVP（最小実装） - 完了 ✅

**目標**: 個人利用で記事を保存・検索できる基本機能

### ✅ 完了した機能

#### 1. 認証・同期（2025-10-13完了）

- Supabase Auth + Google OAuth
- @supabase/ssrによるCookieベースセッション管理
- Next.js middlewareでの認証チェック
- **テスト**: 26ユニットテスト + 3 E2Eテスト
- **仕様**: specs/google-oauth/

#### 2. 記事登録（2025-10-19完了）

- React Hook Form + Zodによるフォーム実装
- プラットフォーム自動判定（7プラットフォーム対応）
- Server Action（createArticle）
- Cookie認証対応（@supabase/ssr migration）
- **テスト**: 69テスト（統合10 + UT 53 + E2E 6）
- **コードレビュー**: 5人中4人がEXCELLENT評価
- **仕様**: specs/article-registration/

#### 3. 記事一覧表示（2025-10-19完了）

- Server Componentでデータフェッチ（getArticles）
- カード形式表示（ArticleCard, ArticleList）
- プラットフォームアイコン表示（7プラットフォーム対応）
- N+1クエリ問題解決（7回 → 2回クエリ、71%削減）
- **テスト**: 26テスト（統合8 + UT 12 + E2E 6）
- **コードレビュー**: 2回実施・N+1問題解決確認
- **仕様**: specs/article-list/

#### 4. 検索・フィルタリング（2025-10-20完了）

- searchArticles/getAllTags Server Actions
- SearchBar/TagFilter/SortSelector/SearchFiltersコンポーネント
- URL Search Paramsによる状態管理（ブラウザバック対応）
- デバウンス検索（300ms、use-debounce使用）
- UUID検証によるセキュリティ対策（AND条件タグフィルタ）
- 4種類の並び順（登録日/更新日 × 新しい順/古い順）
- **テスト**: 60テスト（統合14 + UT 33 + E2E 13）
- **コードレビュー**: 品質スコア95/100（Critical Issues 0件）
- **仕様**: specs/article-search/

#### 5. 記事編集・削除（2025-11-03完了）

- getArticleById/updateArticle/deleteArticle Server Actions
- 記事詳細ページ（`/articles/[id]`）と編集フォーム
- AlertDialogによる削除確認ダイアログ
- ArticleFormの初期値対応・ラベルカスタマイズ機能
- Next.js 15対応（動的ルートparamsのawait化）
- **テスト**: 23テスト（統合11 + UT 4 + E2E 2）
- **仕様**: specs/article-edit/

---

## 🎯 Phase 2: UX改善と機能拡張

### 優先順位1: UX改善（ユーザーフィードバック対応）

**目的**: 実際の使用感から見つかったUX課題を改善し、使いやすさを向上させる

**タスク**:

#### トップ画面

- [ ] 記事検索リンクの必要性を検討（記事一覧との違いを明確化するか、リンクを削除するか）

#### 一覧画面

- [ ] ヘッダーコンポーネントを追加（ナビゲーション統一）
- [ ] 編集画面への遷移を高速化（即座に遷移 → ローディング表示 → データ取得）
- [ ] ボタンデザインの統一（「記事を開く」「記事を登録」「編集」のスタイル統一）
- [x] 「◯件の記事が見つかりました」の位置をページ上部へ移動（フィルターの上に表示）✅

#### 編集画面

- [ ] 更新成功時のユーザーフィードバック改善（トースト表示 + 一覧画面へ自動遷移）
- [ ] 削除ボタンの配置・デザイン改善（「記事を更新」ボタンとの視覚的統一と配置調整）

### 技術的負債・改善項目

**優先度: 低（時間があれば対応）**

1. **Vitestアップデート（v1.6.1 → v3.x）**
   - 現状: `npm run test`で「The CJS build of Vite's Node API is deprecated」警告が表示される
   - 影響: テスト結果には影響なし（無害な警告）
   - 対応: Vitest v3へのメジャーアップデート（破壊的変更の可能性あり）
   - 注意: アップデート後は全テストの再実行と動作確認が必要

2. **DRY原則違反の解消（コードレビュー指摘）**
   - SearchBar/TagFilter/SortSelectorでURL Search Params更新ロジックが重複
   - 提案: 共通フック`useSearchParamsUpdate`の作成
   - 影響: コードの保守性向上（機能には影響なし）

### 機能拡張

- メモ・コメント機能
- 学習進捗管理（読んだ/理解した/実践した）
- 自動収集（RSS登録による半自動収集）
- アーカイブ機能

---

## 🚀 Phase 3: チーム対応

- マルチユーザー対応（10人以下想定）
- 記事共有機能

---

## 🛠 技術スタック

**フレームワーク**: Next.js 15 (App Router)
**認証**: Supabase Auth (Google OAuth)
**データベース**: Supabase PostgreSQL + RLS
**UI**: React 19, TailwindCSS, shadcn/ui
**フォーム**: React Hook Form + Zod
**テスト**: Vitest (UT/統合), Playwright (E2E)

**詳細**: [README.md](../README.md)

---

## 💡 開発時の参考情報

### 重要なドキュメント

- [CLAUDE.md](../CLAUDE.md) - 開発ガイドライン（ワークフロー、コマンド、品質原則）
- [tests/README.md](../tests/README.md) - テストガイドライン
- [docs/database-schema-implementation.md](./database-schema-implementation.md) - データベース設計
- [specs/README.md](../specs/README.md) - 仕様駆動開発ガイド

### 技術的な決定

- **認証**: Google OAuthのみ（EmailPasswordは削除済み）
- **データベース**: Supabase PostgreSQL + Row Level Security
- **テスト戦略**: ユニットテスト（Vitest）+ スモークE2E（Playwright via Chrome DevTools MCP）
- **セッション管理**: @supabase/ssrによるCookieベース

---

## 🔄 次回セッション開始時のチェックリスト

**次セッションの最優先タスク**: 📝 **UX改善（ユーザーフィードバック対応）**

再開時に以下を確認してから開発を開始：

1. **環境確認**
   - [ ] `npm run dev` でローカル開発サーバーを起動
   - [ ] `npm run lint && npm run tsc` でエラーがないか確認
   - [ ] Chrome DevTools MCP接続確認

2. **前回の作業確認**
   - [ ] このplan.mdの「次にやるべきこと」を読む

3. **新機能開発の場合**
   - [ ] `specs/[feature-name]/`に仕様作成（brief.md, design.md, tasks.md）
   - [ ] CLAUDE.mdの「実装ワークフロー」に従って実装

---

## 📝 最近のセッション作業サマリー

### 2025-11-XX: 記事件数表示位置変更（UX改善）

**実装内容**:

- 「◯件の記事が見つかりました」の表示位置をページ上部（フィルターの上）へ移動
- SearchFiltersコンポーネントから件数表示を削除し、articles/page.tsxで件数表示を追加
- resultCount propsを削除（後方互換性不要のため完全削除）

**変更ファイル**:

- `src/components/articles/SearchFilters.tsx` (resultCount props削除、件数表示削除)
- `src/app/articles/page.tsx` (件数表示をページ上部に追加)

**テスト結果**: E2Eテスト18件すべて合格（article-list 6件 + article-search 12件）

### 2025-11-03: 記事編集・削除機能完全実装（100%完了）

**実装内容**:

- getArticleById/updateArticle/deleteArticle Server Actions（RLS・バリデーション対応）
- 記事詳細ページ（`/articles/[id]`）とEditArticleFormコンポーネント
- AlertDialogによる削除確認ダイアログ（Radix UI）
- ArticleFormの初期値対応・カスタムラベル機能
- Next.js 15対応（動的ルートparamsのawait化）
- ArticleCardに編集リンクを追加、data-testidでE2Eテスト対応
- 23テスト実装（統合11 + UT 4 + E2E 2）

**変更ファイル**:

- `src/app/actions/articles.ts` (getArticleById, updateArticle, deleteArticle)
- `src/app/articles/[id]/page.tsx` (記事詳細ページ)
- `src/app/articles/[id]/_components/EditArticleForm.tsx`
- `src/components/articles/ArticleForm.tsx` (初期値・ラベル対応)
- `src/components/articles/ArticleCard.tsx` (編集リンク追加)
- `src/components/ui/alert-dialog.tsx` (新規)
- `tests/unit/components/ArticleForm.test.tsx` (初期値・ラベルテスト追加)
- `tests/unit/components/EditArticleForm.test.tsx` (新規)
- `tests/integration/actions/article-edit.test.ts` (新規)
- `tests/e2e/article-edit.spec.ts` (新規)

**テスト結果**: 184テストすべて合格（Vitest + Playwright）

### 2025-10-20: 検索・フィルタリング機能完全実装（100%完了）

**実装内容**:

- searchArticles/getAllTags Server Actions
- SearchBar/TagFilter/SortSelector/SearchFiltersコンポーネント
- URL Search Paramsによる状態管理（ブラウザバック対応）
- デバウンス検索（300ms）、UUID検証セキュリティ対策
- 60テスト実装（統合14 + UT 33 + E2E 13）

**変更ファイル**:

- `src/app/actions/articles.ts` (searchArticles, getAllTags)
- `src/components/articles/` (4コンポーネント)
- `tests/unit/components/` (SearchBar, TagFilter, SortSelector)
- `tests/e2e/article-search.spec.ts`
- `tests/unit/components/ArticleForm.test.tsx` (未処理エラー修正)

**コードレビュー**: 品質スコア95/100（Critical Issues 0件、Warnings 1件）

### 2025-10-19: 記事一覧表示機能完全実装

**実装内容**:

- Server Component + getArticles Server Action
- ArticleCard/ArticleList/PlatformIconコンポーネント
- N+1クエリ問題解決（7回 → 2回クエリ、71%削減）
- 26テスト実装（統合8 + UT 12 + E2E 6）

**変更ファイル**:

- `src/app/actions/articles.ts` (getArticles追加、N+1修正)
- `src/components/articles/` (3コンポーネント新規作成)
- `src/app/articles/page.tsx` (記事一覧ページ)
- `src/app/_components/HomePage.tsx` (記事一覧リンク追加)
- `tests/unit/components/` (2テストファイル)
- `tests/integration/actions/articles.test.ts` (getArticles統合テスト)
- `tests/e2e/article-list.spec.ts` (E2Eテスト)

**コードレビュー**: 2回実施・N+1問題解決確認・Critical Issues 0件

### 2025-10-19: 記事登録機能完全実装

**実装内容**:

- React Hook Form + Zod + Server Action
- プラットフォーム自動判定（7プラットフォーム）
- Cookie認証対応（@supabase/ssr migration）
- 69テスト実装（統合10 + UT 53 + E2E 6）

**コードレビュー**: 5人中4人がEXCELLENT評価・Critical Issues 0件

### 2025-10-13: Google OAuth認証完全実装

**実装内容**:

- Supabase Auth + Google OAuth
- @supabase/ssrによるCookieベースセッション管理
- 29テスト実装（UT 26 + E2E 3）

---

## 🎯 将来的な検討事項

- [ ] ブラウザ拡張機能（ワンクリック保存）
- [ ] モバイルアプリ（PWA or React Native）
- [ ] プラットフォーム自動判定の精度向上
- [ ] 記事内容の自動要約（AI活用）

---

**現在フェーズ**: Phase 2（UX改善と機能拡張）
**次のタスク**: UX改善（ユーザーフィードバック対応）
