# 検索・フィルタリング機能 - タスク一覧

## Phase 1: 仕様作成 ✅
- [x] brief.md 作成
- [x] design.md 作成
- [x] tasks.md 作成

## Phase 2: 実装

### 2.1 型定義
- [ ] SearchParams型定義（src/types/article.ts）
- [ ] SearchFiltersProps型定義

### 2.2 Server Action実装
- [ ] searchArticles 実装（src/app/actions/articles.ts）
  - キーワード検索（ILIKE）
  - タグフィルタ（AND条件）
  - ソート機能
  - 認証チェック
  - エラーハンドリング

### 2.3 コンポーネント実装
- [ ] SearchBar コンポーネント（src/components/articles/SearchBar.tsx）
  - Input フィールド
  - debounce処理（300ms）
  - URL Search Params更新
- [ ] TagFilter コンポーネント（src/components/articles/TagFilter.tsx）
  - タグ一覧取得（getAllTags Server Action）
  - チェックボックス表示
  - 複数選択対応
  - URL Search Params更新
- [ ] SortSelector コンポーネント（src/components/articles/SortSelector.tsx）
  - Select ドロップダウン
  - ソート順選択（登録日順、更新日順）
  - URL Search Params更新
- [ ] SearchFilters コンテナ（src/components/articles/SearchFilters.tsx）
  - 上記3コンポーネントをまとめる
  - クリアボタン
  - 検索結果件数表示

### 2.4 ページ統合
- [ ] /articles ページ更新（src/app/articles/page.tsx）
  - Search Paramsを受け取る
  - searchArticlesを呼び出す
  - SearchFiltersを配置
  - ArticleListに検索結果を渡す

### 2.5 品質チェック
- [ ] Chrome DevTools MCPで動作確認
- [ ] npm run lint
- [ ] npm run tsc

## Phase 3: テスト

### 3.1 ユニットテスト
- [ ] SearchBar コンポーネントテスト
  - レンダリング
  - debounce動作
  - Search Params更新
- [ ] TagFilter コンポーネントテスト
  - タグ一覧表示
  - 複数選択
  - Search Params更新
- [ ] SortSelector コンポーネントテスト
  - ソート順選択
  - Search Params更新
- [ ] searchArticles Server Actionテスト
  - キーワード検索
  - タグフィルタ（AND条件）
  - ソート機能
  - 認証エラー
  - DBエラー

### 3.2 統合テスト
- [ ] searchArticles統合テスト
  - キーワード + タグ + ソートの組み合わせ
  - 空検索結果
  - 検索条件クリア

### 3.3 E2Eテスト
- [ ] 検索フロー（Chrome DevTools MCP）
  - キーワード検索 → 結果表示
  - タグフィルタ → 結果絞り込み
  - ソート変更 → 順序変更
  - クリアボタン → 全記事表示

### 3.4 コードレビュー
- [ ] multi-expert-code-review実施
- [ ] 指摘事項対応（Critical/Warning優先）

## Phase 4: 完了
- [ ] plan.md更新（進捗バー、完了マーク）
- [ ] コミット・プッシュ
