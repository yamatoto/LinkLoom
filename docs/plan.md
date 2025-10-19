# LinkLoom 開発計画と進捗

**最終更新**: 2025-10-19 (記事登録機能 - 完全実装完了・テスト実施済み)

> **📝 進捗更新ルール（Claude Code向け）**:
> タスク完了時は必ずユーザーに確認を取り、許可後にこのファイルを更新してください。
>
> - 完了した機能に ✅ マークを追加
> - 進捗バーを更新
> - **最終更新日**を更新
>   詳細は [CLAUDE.md](../CLAUDE.md) の「タスク完了時のワークフロー」を参照。

## 📖 プロジェクト概要

技術記事を効率的に保存・検索・管理するパーソナル知識管理システム。note、Qiita、Zennなど複数のプラットフォームの記事を一元管理し、タグで分類、キーワード検索で素早くアクセスできる。

### 解決する課題

- 気になった技術記事を後で見つけられない
- 複数のプラットフォーム（note, Qiita, Zenn等）に記事が散在
- 記事の分類・整理ができない
- 学習進捗や理解度の管理ができない

---

## 🎯 全体計画（3フェーズ）

### Phase 1: MVP（最小実装） - 現在開発中

**目標**: 個人利用で記事を保存・検索できる基本機能

- ✅ **認証・同期** - **完了** (2025-10-13)
  - Googleログイン（Google OAuth）
  - 複数デバイス間でデータ同期
  - Supabase Auth統合
  - E2Eテスト完備

- ✅ **記事管理（基本機能）** - **完了** (2025-10-19)
  - ✅ 記事登録フォーム実装（React Hook Form + Zod）
  - ✅ プラットフォーム自動判定（7プラットフォーム対応）
  - ✅ Server Action実装（createArticle）
  - ✅ パフォーマンス最適化（useMemo、Promise.all並列化）
  - ✅ セキュリティ強化（エラーメッセージサニタイズ）
  - ✅ Cookie認証対応（@supabase/ssr migration）
  - ✅ 記事登録動作確認（Chrome DevTools MCP）
  - ✅ 環境変数エラーメッセージ改善
  - ✅ Server Actions統合テスト（10テスト実装）
  - ✅ ユニットテスト実装（platform-detector 32テスト、ArticleForm 21テスト）
  - ✅ E2Eテスト実装（6スモークテスト）
  - ✅ 静的解析クリア（lint, tsc）
  - ✅ Multi-Expert Code Review実施
  - 📝 TODO: 編集・削除・アーカイブ機能

- 📝 **検索・フィルタリング** - **未実装**
  - キーワード検索（タイトル・説明文）
  - タグフィルタ（複数選択、AND条件）
  - ソート順: 登録順

- 📝 **記事表示** - **未実装**
  - カード形式一覧表示
  - 表示情報: プラットフォームアイコン、タイトル、説明、タグ、投稿日
  - ブックマーク機能

### Phase 2: 機能拡張（予定）

**目標**: 学習管理と半自動収集

- 📝 メモ・コメント機能
- 📊 学習進捗管理（読んだ/理解した/実践した）
- 🔄 自動収集（RSS登録による半自動収集）

### Phase 3: チーム対応（予定）

**目標**: 小規模チームでの記事共有

- 👥 マルチユーザー対応（10人以下想定）
- 🔗 記事共有機能

---

## ✅ 完了した機能

### Google OAuth認証（2025-10-13完了）

**実装内容**:

- Supabase Authを使用したGoogle OAuth認証
- @supabase/ssrによるセッション管理
- Next.js middlewareでの認証チェック
- ログイン/ログアウト機能

**テスト**:

- ✅ 26ユニットテスト（Vitest）
- ✅ 3 E2Eテスト（Playwright）
- ✅ Lint/TypeScriptエラーゼロ

**仕様ドキュメント**:

- specs/google-oauth/ （brief.md, design.md, tasks.md）

---

## 📝 次にやるべきこと（Phase 1 MVP完成まで）

### ✅ **記事登録機能（完了 - 100%）** (2025-10-19)

**完了タスク**:

- ✅ 記事登録フォーム実装（React Hook Form + Zod）
- ✅ プラットフォーム自動判定（7プラットフォーム対応）
- ✅ Server Action実装（createArticle）
- ✅ Cookie認証対応（localStorage → Cookie migration）
- ✅ 環境変数エラーメッセージ改善
- ✅ Server Actions統合テスト（10テスト実装）
- ✅ ユニットテスト実装（platform-detector 32テスト、ArticleForm 21テスト）
- ✅ E2Eテスト実装（6スモークテスト）
- ✅ 記事登録動作確認（Chrome DevTools MCP）
- ✅ 静的解析クリア（lint, tsc）
- ✅ Multi-Expert Code Review完了（Critical Issues: 0）

**テスト結果**:
- 総テスト数: 69テスト（統合10 + platform-detector 32 + ArticleForm 21 + E2E 6）
- 静的解析: Lint/TypeScriptエラー 0件
- コードレビュー: 5人中4人がEXCELLENT評価

**次の機能**: 記事一覧表示機能の実装

---

### 優先順位1: データベース設計と記事管理基盤 ✅ **完了**

- ✅ データベーススキーマ設計完了
- ✅ Supabaseマイグレーション完了
- ✅ 型定義完了（Article, Tag, ArticleTag）
- ✅ Zodスキーマ完了

### 優先順位2: 記事登録機能 ✅ **完了**（2025-10-19）

**完了タスク**:

- ✅ 記事登録フォーム（React Hook Form + Zod）
- ✅ プラットフォーム自動判定（7プラットフォーム対応）
- ✅ Server Action実装（createArticle）
- ✅ パフォーマンス最適化（useMemo、Promise.all並列化）
- ✅ セキュリティ強化（エラーメッセージサニタイズ）
- ✅ Cookie認証対応（localStorage → Cookie migration）
- ✅ 環境変数エラーメッセージ改善
- ✅ Server Actions統合テスト（10テスト実装）
- ✅ ユニットテスト実装（platform-detector 32テスト、ArticleForm 21テスト）
- ✅ E2Eテスト実装（6スモークテスト）
- ✅ 記事登録動作確認（Chrome DevTools MCP）
- ✅ 静的解析クリア（lint, tsc）
- ✅ Multi-Expert Code Review（Critical Issues: 0）

### 優先順位3: 記事一覧表示

**目的**: 登録した記事を一覧表示できるようにする

**タスク**:

1. **記事一覧ページ**
   - Server Componentでデータフェッチ
   - カード形式表示
   - プラットフォームアイコン表示

2. **React Queryによるデータフェッチ**
   - useQueryでキャッシュ管理
   - ローディング・エラー状態

3. **テスト**
   - ユニットテスト（コンポーネント）
   - E2Eテスト（一覧表示）

### 優先順位4: 検索・フィルタリング

**目的**: 記事を検索・絞り込みできるようにする

**タスク**:

1. **検索UI**
   - キーワード検索フォーム
   - タグフィルタ（複数選択）
   - ソート順選択

2. **検索API**
   - Supabase Full-Text Search
   - タグによる絞り込み
   - ページネーション

3. **テスト**
   - ユニットテスト（検索ロジック）
   - E2Eテスト（検索フロー）

### 優先順位5: 記事編集・削除

**目的**: 登録した記事を編集・削除できるようにする

**タスク**:

1. **編集・削除UI**
   - 記事詳細ページ
   - 編集フォーム
   - 削除確認ダイアログ

2. **編集・削除API**
   - Server ActionsまたはAPI Routes
   - Supabaseへの更新・削除

3. **テスト**
   - ユニットテスト
   - E2Eテスト

---

## 🛠 技術スタック

**詳細**: [README.md](../README.md) を参照してください。

---

## 📊 現在の進捗状況

### Phase 1 MVP進捗

```
認証・同期   ████████████████████ 100% ✅
記事登録     ████████████████████ 100% ✅
記事表示     ░░░░░░░░░░░░░░░░░░░░   0% 📝
検索機能     ░░░░░░░░░░░░░░░░░░░░   0% 📝
編集・削除   ░░░░░░░░░░░░░░░░░░░░   0% 📝

全体進捗:    ████████░░░░░░░░░░░░  40%
```

### 完了タスク数

- ✅ 認証機能: 26タスク（すべて完了）
- ✅ 記事登録: 14/14タスク（100%完了）
  - ✅ フォーム実装
  - ✅ プラットフォーム自動判定
  - ✅ Server Action実装
  - ✅ パフォーマンス最適化
  - ✅ セキュリティ強化
  - ✅ Cookie認証対応
  - ✅ 環境変数エラーメッセージ改善
  - ✅ Server Actions統合テスト（10テスト）
  - ✅ ユニットテスト実装（53テスト）
  - ✅ E2Eテスト実装（6テスト）
  - ✅ Chrome DevTools MCP動作確認
  - ✅ 静的解析クリア
  - ✅ Multi-Expert Code Review
  - ✅ 総テスト数: 69テスト
- 📝 記事表示: 0タスク
- 📝 検索機能: 0タスク
- 📝 編集・削除: 0タスク

---

## 💡 開発時の参考情報

**開発ワークフロー・カスタムコマンド・Agent Skills**: [CLAUDE.md](../CLAUDE.md) を参照してください。

### 重要なドキュメント

- [CLAUDE.md](../CLAUDE.md) - 開発ガイドライン（ワークフロー、コマンド、品質原則）
- [tests/README.md](../tests/README.md) - テストガイドライン
- [docs/database-schema-implementation.md](./database-schema-implementation.md) - データベース設計
- [specs/README.md](../specs/README.md) - 仕様駆動開発ガイド

---

## 🚀 次回セッション開始時のチェックリスト

**次セッションの最優先タスク**: 📝 **記事一覧表示機能の実装**

再開時に以下を確認してから開発を開始しましょう：

1. **環境確認**
   - [ ] `npm run dev` でローカル開発サーバーを起動
   - [ ] `npm run lint` と `npm run tsc` でエラーがないか確認
   - [ ] Chrome DevTools MCP接続確認

2. **前回の作業確認**
   - [ ] このplan.mdの「次にやるべきこと」を読む
   - [ ] `git status` で変更ファイルを確認（コミット前の状態）
   - [ ] 前回のセッション作業内容を確認

3. **記事一覧表示機能の実装**
   - [ ] Server Componentでデータフェッチ実装
   - [ ] カード形式UIコンポーネント作成
   - [ ] プラットフォームアイコン表示
   - [ ] ローディング・エラー状態ハンドリング
   - [ ] Chrome DevTools MCPで動作確認
   - [ ] 静的解析（lint, tsc）
   - [ ] コードレビュー
   - [ ] **実装完了後にコミット・プッシュ**

---

## 📝 メモ・決定事項

### 技術的な決定

- **認証**: Google OAuthのみ（EmailPasswordは削除済み）
- **データベース**: Supabase PostgreSQL + Row Level Security
- **キャッシュ**: React Query (TanStack Query) で5分間キャッシュ
- **テスト戦略**: ユニットテスト（Vitest）+ スモークE2E（Playwright）

### 2025-10-19セッション作業内容

**セッション1: 記事登録機能実装**

1. ✅ 記事登録フォーム実装（React Hook Form + Zod）
   - `src/schemas/article.schema.ts`
   - `src/components/articles/ArticleForm.tsx`
   - `src/app/articles/new/page.tsx`

2. ✅ プラットフォーム自動判定機能
   - `src/lib/platform-detector.ts`
   - 7プラットフォーム対応（Zenn, Qiita, note, GitHub, Medium, はてなブログ, Dev.to）

3. ✅ Server Action実装
   - `src/app/actions/articles.ts` (createArticle)
   - `src/lib/supabase/server.ts`

4. ✅ コードレビュー対応
   - セキュリティ: エラーメッセージサニタイズ（本番環境で機密情報非表示）
   - パフォーマンス: useMemoでプラットフォーム判定最適化
   - パフォーマンス: Promise.allで認証チェックとDB取得を並列化

**セッション2: 記事登録バグ修正（Cookie認証対応）**

**問題発見**:

- Server Actionsで`AuthSessionMissingError`発生
- `@supabase/supabase-js`のlocalStorage認証がServer Actionsで利用不可

**根本原因**:

- `src/lib/supabase.ts`が`createClient`（localStorage）を使用
- Next.js App Router + Server ActionsではCookie認証が必須

**解決策実装**:

1. ✅ `src/lib/supabase.ts`を`@supabase/ssr`の`createBrowserClient`に変更
   - localStorage → Cookie認証に移行
   - 不要な`auth`オプション削除（デフォルト設定で十分）

2. ✅ デバッグログ削除
   - `src/app/actions/articles.ts`のconsole.log削除

3. ✅ 動作確認
   - Chrome DevTools MCPで記事登録成功
   - サーバーログにエラーなし（`POST /articles/new 200`）
   - Qiitaプラットフォーム自動判定確認

4. ✅ 静的解析クリア
   - `npm run lint` ✅
   - `npm run tsc` ✅

5. ✅ Multi-Expert Code Review実施
   - Architecture Expert: EXCELLENT
   - Security Expert: EXCELLENT
   - Performance Expert: EXCELLENT
   - Testing Expert: GOOD
   - Modern TS/React Expert: EXCELLENT
   - **Critical Issues: 0**
   - **Warnings: 0**
   - **Suggestions: 2**（優先度: 低〜中）

**セッション3: 記事登録機能完全実装（テスト実装完了）**

1. ✅ 環境変数エラーメッセージ改善
   - `src/lib/supabase.ts`の非nullアサーション削除
   - 不足している環境変数を明確に表示

2. ✅ Server Actions統合テスト実装
   - `tests/integration/actions/articles.test.ts`作成
   - 10テスト実装（成功ケース、認証エラー、バリデーション、DBエラー、並列処理、セキュリティ）

3. ✅ platform-detectorユニットテスト実装
   - `tests/unit/lib/platform-detector.test.ts`作成
   - 32テスト実装（7プラットフォーム + エッジケース）

4. ✅ ArticleFormユニットテスト実装
   - `tests/unit/components/ArticleForm.test.tsx`作成
   - 21テスト実装（レンダリング、フォーム操作、バリデーション、プラットフォーム判定、送信中状態、アクセシビリティ）

5. ✅ E2Eテスト実装
   - `tests/e2e/article-registration.spec.ts`作成
   - 6スモークテスト実装（認証チェック、フォーム送信、プラットフォーム判定、バリデーション、ボタン無効化）

6. ✅ Chrome DevTools MCPで動作確認
   - 実際のブラウザで記事登録フローをエンドツーエンドで検証成功

7. ✅ 静的解析クリア
   - `npm run lint` ✅
   - `npm run tsc` ✅

8. ✅ Multi-Expert Code Review実施
   - 5人の専門家による並列レビュー完了
   - Architecture Expert: GOOD
   - Security Expert: EXCELLENT
   - Performance Expert: EXCELLENT
   - Testing Expert: EXCELLENT
   - Modern TS/React Expert: EXCELLENT
   - **Critical Issues: 0**

**総テスト数**: 69テスト（統合10 + platform-detector 32 + ArticleForm 21 + E2E 6）

**変更ファイル**:

- `src/lib/supabase.ts` (環境変数エラーメッセージ改善)
- `tests/integration/actions/articles.test.ts` (新規作成)
- `tests/unit/lib/platform-detector.test.ts` (新規作成)
- `tests/unit/components/ArticleForm.test.tsx` (新規作成)
- `tests/e2e/article-registration.spec.ts` (新規作成)
- `docs/plan.md` (進捗更新)

### 将来的な検討事項

- [ ] ブラウザ拡張機能（ワンクリック保存）
- [ ] モバイルアプリ（PWA or React Native）
- [ ] プラットフォーム自動判定の精度向上
- [ ] 記事内容の自動要約（AI活用）

---

**現在フェーズ**: Phase 1 MVP（20%完了）
**次のマイルストーン**: 記事管理機能の実装（データベース設計 → 記事登録 → 一覧表示）
