# 記事一覧表示機能 - タスク一覧

## Phase 1: 簡易仕様作成 ✅
- [x] brief.md 作成
- [x] design.md 作成
- [x] tasks.md 作成

## Phase 2: 実装

### 2.1 データフェッチロジック
- [ ] `getArticles` Server Action実装（src/app/actions/articles.ts）
- [ ] 認証チェック
- [ ] Supabaseクエリ（articles + tags結合）
- [ ] エラーハンドリング

### 2.2 コンポーネント作成
- [ ] ArticleCard コンポーネント（src/components/articles/ArticleCard.tsx）
  - プラットフォームアイコン
  - タイトル、説明
  - タグ表示
  - 登録日
  - カード hover効果
- [ ] ArticleList コンポーネント（src/components/articles/ArticleList.tsx）
  - グリッドレイアウト
  - 空状態UI
  - ローディングスケルトン

### 2.3 ページ実装
- [ ] `/articles` ページ（src/app/articles/page.tsx）
  - Server Componentでデータフェッチ
  - ArticleListに渡す
  - エラーバウンダリ

### 2.4 品質チェック
- [ ] Chrome DevTools MCPで動作確認
- [ ] npm run lint
- [ ] npm run tsc

## Phase 3: テスト

### 3.1 ユニットテスト
- [ ] ArticleCard コンポーネントテスト
  - レンダリング
  - プラットフォームアイコン表示
  - タグ表示
  - 日付フォーマット
- [ ] ArticleList コンポーネントテスト
  - 記事リスト表示
  - 空状態
  - グリッドレイアウト
- [ ] getArticles Server Actionテスト
  - 成功ケース
  - 認証エラー
  - DBエラー

### 3.2 E2Eテスト
- [ ] 記事一覧表示フロー
  - ログイン → 記事一覧表示
  - カード表示確認
  - 空状態確認

### 3.3 コードレビュー
- [ ] multi-expert-code-review実施
- [ ] 指摘事項対応（Critical/Warning優先）

## Phase 4: 完了
- [ ] plan.md更新（進捗バー、完了マーク）
- [ ] コミット・プッシュ
