# LinkLoom 開発計画

**最終更新**: 2025-11-03（タスク1完了）

---

## 📖 プロジェクト概要

技術記事を効率的に保存・検索・管理するパーソナル知識管理システム。note、Qiita、Zennなど複数のプラットフォームの記事を一元管理し、タグで分類、キーワード検索で素早くアクセスできる。

---

## 📊 現在の状態

- **Phase 1 MVP**: 100%完了 ✅
- **総テスト数**: 184テスト（すべて合格）
- **静的解析**: Lint/TypeScript エラー0件

### 実装済み機能

- ✅ 認証・同期（Google OAuth）
- ✅ 記事登録（7プラットフォーム対応、自動判定）
- ✅ 記事一覧表示（カード形式）
- ✅ 検索・フィルタリング（キーワード、タグ、並び替え）
- ✅ 記事編集・削除

---

## 🎯 次にやるべきこと（Phase 2: UX改善）

以下のタスクを優先順位順に、一つずつPRにして実装する。

### ✅ タスク1: トップ画面の記事検索リンクを削除（完了）

**目的**: 記事一覧に検索機能が実装済みのため、冗長な「Coming soon...」リンクを削除

**実装内容**:

- 記事検索カードを削除（ログイン時・未ログイン時ともに）
- グリッドレイアウトを2カラムに変更（`sm:grid-cols-2 lg:grid-cols-2`）

**テスト結果**: E2Eテスト29件すべて合格 ✅

---

### タスク2: 一覧画面にヘッダーコンポーネントを追加

**目的**: ナビゲーションの統一（トップ画面と同じHeader表示）

**対象ファイル**:

- `src/app/articles/page.tsx`

**実装内容**:

- Headerコンポーネントをインポート・追加
- レイアウトを全画面構造に調整（`min-h-screen`, `bg-gray-50`）

**テスト**: 既存のE2Eテスト（article-list, article-search）で動作確認

---

### タスク3: ボタンデザインの統一

**目的**: UI一貫性の向上（「記事を開く」「編集」「記事を登録」のスタイル統一）

**対象ファイル**:

- `src/components/articles/ArticleCard.tsx`
- `src/app/articles/page.tsx`

**実装内容**:

- ArticleCard: 「記事を開く」をprimary、「編集」をsecondary（outline）に統一
- articles/page.tsx: 「記事を登録」ボタンのスタイルを確認・調整

**テスト**: 既存のユニットテスト・E2Eテストで動作確認

---

### タスク4: 削除ボタンの配置・デザイン改善

**目的**: 更新ボタンとの視覚的統一と配置調整

**対象ファイル**:

- `src/app/articles/[id]/_components/EditArticleForm.tsx`

**実装内容**:

- 削除ボタンを更新ボタンと同じ行に配置（Flexレイアウト）
- ボタン間のスペーシング調整
- 削除ボタンのvariantを`destructive`のまま維持（警告色として適切）

**テスト**: 既存のE2Eテスト（article-edit）で動作確認

---

### タスク5: 更新成功時のユーザーフィードバック改善

**目的**: 更新後の自動遷移で使いやすさ向上

**対象ファイル**:

- `src/app/articles/[id]/_components/EditArticleForm.tsx`

**実装内容**:

- 更新成功時に`router.push('/articles')`で一覧画面へ自動遷移
- トースト表示は既に実装済み（`toast.success('記事を更新しました')`）

**テスト**: 既存のE2Eテスト（article-edit）で動作確認

---

### タスク6: 編集画面への遷移を高速化

**目的**: ローディング表示でUX向上

**対象ファイル**:

- `src/app/articles/[id]/loading.tsx`（新規作成）

**実装内容**:

- Next.jsの`loading.tsx`を作成
- スケルトンローディングまたはスピナー表示

**テスト**: 手動確認（ローディング表示の視覚確認）

---

## 🛠 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **認証**: Supabase Auth (Google OAuth)
- **データベース**: Supabase PostgreSQL + RLS
- **UI**: React 19, TailwindCSS, shadcn/ui
- **フォーム**: React Hook Form + Zod
- **テスト**: Vitest (UT/統合), Playwright (E2E)

---

## 💡 重要なドキュメント

- [CLAUDE.md](../CLAUDE.md) - 開発ガイドライン（ワークフロー、コマンド、品質原則）
- [tests/README.md](../tests/README.md) - テストガイドライン
- [docs/database-schema-implementation.md](./database-schema-implementation.md) - データベース設計
- [specs/README.md](../specs/README.md) - 仕様駆動開発ガイド

---

## 🔄 セッション開始時のチェックリスト

1. **環境確認**
   - [ ] `npm run dev` でローカル開発サーバーを起動
   - [ ] `npm run lint && npm run tsc` でエラーがないか確認

2. **作業確認**
   - [ ] このplan.mdの「次にやるべきこと」を読む
   - [ ] 最初の未完了タスクから着手

3. **実装完了時**
   - [ ] テストを実行（`npm run test` + `npm run e2e:ci`）
   - [ ] コミット作成
   - [ ] このplan.mdのタスクを完了にマーク

---

## 🎯 将来的な検討事項（Phase 3以降）

- メモ・コメント機能
- 学習進捗管理（読んだ/理解した/実践した）
- 自動収集（RSS登録による半自動収集）
- アーカイブ機能
- マルチユーザー対応（チーム対応）
- 記事共有機能

---

**現在フェーズ**: Phase 2（UX改善）
**次のタスク**: タスク2（一覧画面にヘッダーコンポーネントを追加）
