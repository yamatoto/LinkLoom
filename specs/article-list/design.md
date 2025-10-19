# 記事一覧表示機能 - 設計メモ

## アーキテクチャ

### データフロー
1. Server Component (`/articles/page.tsx`) でデータフェッチ
2. Server Action (`getArticles`) でSupabaseから記事取得
3. ArticleList → ArticleCard でカード形式表示

### コンポーネント構成
- **ArticleCard**: 単一記事カード（プラットフォームアイコン、タイトル、説明、タグ、日付）
- **ArticleList**: カード一覧コンテナ（グリッドレイアウト、空状態）
- **page.tsx**: Server Componentでデータフェッチ、ArticleListに渡す

## 主要技術

### データフェッチ
- Server Action (`getArticles`)
- Supabase RLS（認証済みユーザーの記事のみ取得）
- ソート順: 登録日降順（新しい順）

### UI/UX
- カード形式グリッドレイアウト（shadcn/ui Card）
- プラットフォームアイコン表示（platform-detector利用）
- 空状態（記事なし時のメッセージ）
- ローディングスケルトン
- エラートースト表示（sonner）

## セキュリティ
- RLSで他ユーザーの記事は取得不可
- Server Actionで認証チェック
