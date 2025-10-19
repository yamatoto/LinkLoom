# 検索・フィルタリング機能 - 設計メモ

## アーキテクチャ

### データフロー
1. Client Component（SearchBar, TagFilter, SortSelector）でユーザー入力
2. URL Search Paramsで検索条件を管理（ブラウザバック対応）
3. Server Component（/articles/page.tsx）で検索条件を取得
4. Server Action（searchArticles）でSupabaseから記事を検索・フィルタ
5. ArticleListで検索結果を表示

### コンポーネント構成
- **SearchBar**: キーワード入力フィールド（debounce 300ms）
- **TagFilter**: タグ選択チェックボックス（複数選択可能）
- **SortSelector**: ソート順選択ドロップダウン
- **SearchFilters**: 上記3コンポーネントをまとめるコンテナ
- **page.tsx**: Search Paramsを受け取り、searchArticlesを呼び出す

## 主要技術

### 検索クエリ（searchArticles）
```typescript
type SearchParams = {
  keyword?: string        // タイトル・説明文の部分一致検索（ILIKE）
  tagIds?: string[]       // タグID配列（AND条件）
  sortBy?: 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}
```

### データベースクエリ
- **キーワード検索**: PostgreSQL ILIKE（大文字小文字区別なし）
- **タグフィルタ**: article_tags テーブルでJOIN + HAVING COUNT = タグ数（AND条件）
- **ソート**: ORDER BY created_at/updated_at
- **パフォーマンス**: 既存のB-treeインデックス活用

### UI/UX
- **検索フォーム**: 記事一覧の上部に配置
- **リアルタイム検索**: キーワード入力時debounce後に自動検索
- **URL同期**: Search Paramsで検索条件を保存（共有可能）
- **検索結果件数**: 「12件の記事が見つかりました」
- **クリアボタン**: すべての検索条件をリセット

## セキュリティ
- RLSで他ユーザーの記事は検索対象外
- Server Actionで認証チェック
- SQLインジェクション対策（Supabase parameterized query）
