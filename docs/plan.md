# LinkLoom 開発計画と進捗

**最終更新**: 2025-10-19 (Phase 1 MVP: 60%完了)

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
検索機能     ░░░░░░░░░░░░░░░░░░░░   0% 📝
編集・削除   ░░░░░░░░░░░░░░░░░░░░   0% 📝

全体進捗:    ████████████░░░░░░░░  60%
```

### 総テスト数

- **95テスト** すべて合格
  - 記事登録: 69テスト（統合10 + UT 53 + E2E 6）
  - 記事一覧: 26テスト（統合8 + UT 12 + E2E 6）
- **静的解析**: Lint/TypeScript エラー0件

---

## 🎯 Phase 1: MVP（最小実装） - 現在開発中

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

### 📝 未実装の機能

#### 4. 検索・フィルタリング
- キーワード検索（タイトル・説明文）
- タグフィルタ（複数選択、AND条件）
- ソート順: 登録日順

#### 5. 記事編集・削除・アーカイブ
- 記事詳細ページ
- 編集フォーム
- 削除確認ダイアログ
- アーカイブ機能

---

## 📝 次にやるべきこと

### 優先順位1: 検索・フィルタリング機能

**目的**: 記事を検索・絞り込みできるようにする

**タスク**:
1. 検索UI（キーワード検索フォーム、タグフィルタ、ソート順選択）
2. 検索API（Supabase Full-Text Search、タグ絞り込み）
3. テスト（ユニット + E2E）

### 優先順位2: 記事編集・削除

**目的**: 登録した記事を編集・削除できるようにする

**タスク**:
1. 記事詳細ページ + 編集フォーム
2. Server Actions（updateArticle, deleteArticle）
3. テスト（ユニット + E2E）

---

## 🚀 Phase 2-3: 将来の拡張（予定）

### Phase 2: 機能拡張
- メモ・コメント機能
- 学習進捗管理（読んだ/理解した/実践した）
- 自動収集（RSS登録による半自動収集）

### Phase 3: チーム対応
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

**次セッションの最優先タスク**: 📝 **検索・フィルタリング機能実装**

再開時に以下を確認してから開発を開始：

1. **環境確認**
   - [ ] `npm run dev` でローカル開発サーバーを起動
   - [ ] `npm run lint && npm run tsc` でエラーがないか確認
   - [ ] Chrome DevTools MCP接続確認

2. **前回の作業確認**
   - [ ] このplan.mdの「次にやるべきこと」を読む
   - [ ] `git status` で変更ファイルを確認
   - [ ] 未コミットの変更があればコミット

3. **新機能開発の場合**
   - [ ] `specs/[feature-name]/`に仕様作成（brief.md, design.md, tasks.md）
   - [ ] CLAUDE.mdの「実装ワークフロー」に従って実装

---

## 📝 最近のセッション作業サマリー

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

**現在フェーズ**: Phase 1 MVP（60%完了）
**次のタスク**: 検索・フィルタリング機能実装
