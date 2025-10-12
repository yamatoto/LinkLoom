# 設計メモ（design.md の例）

## コンポーネント構成

- `ArticleForm` - メインフォームコンポーネント
- `UrlInput` - URL入力とバリデーション
- `TagSelector` - タグ選択UI

## データフロー

1. ユーザーがURL入力
2. `/api/fetch-metadata` でメタデータ取得
3. フォーム自動入力
4. ユーザーが確認・編集
5. `/api/articles` でDB保存

## 技術選択

- **バリデーション**: Zod
- **フォーム管理**: React Hook Form
- **状態管理**: Zustand（タグ一覧キャッシュ）
- **API**: Next.js API Routes
