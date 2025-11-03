# 設計メモ

## コンポーネント構成

- Server Component `ArticleDetailPage` (`src/app/articles/[id]/page.tsx`) が記事取得とエラーハンドリングを担当
- クライアントコンポーネント `EditArticleForm` がフォーム送信・削除処理・トースト表示を管理
- 既存 `ArticleForm` を再利用し、初期値とボタンラベルをプロップスで差し替え
- 確認用モーダルは shadcn/ui の `AlertDialog` を採用

## データフロー

1. Server Component で Supabase から記事詳細を取得し、認証エラー時は `/login` へリダイレクト
2. 取得した記事データを `EditArticleForm` へ渡し、初期値に設定
3. フォーム送信時に `updateArticle` Server Action を呼び出し、成功後に `/articles` を再検証
4. 削除ボタンで `AlertDialog` を表示し、確定後に `deleteArticle` を実行して一覧へ遷移

## 技術選択

- Supabase Server Client（既存ロジックを踏襲）
- React Hook Form + Zod（バリデーション共通化）
- `revalidatePath` で一覧・トップをキャッシュ更新
- `sonner` トーストで成功/失敗通知

## 制約・注意点

- URL変更時は再度プラットフォームを推測し、存在しない場合は `null` を保存
- RLSにより他ユーザーの記事へアクセスできないため、`getArticleById` は `not found` として扱う
- 削除成功後はフォームを再利用しないため、送信中状態を確実に解除し二重送信を防ぐ
- E2Eでは既存記事のシードデータを活用し、編集・削除の副作用がテスト間で衝突しないようリセットスクリプトを確認
