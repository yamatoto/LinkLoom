# Supabaseマイグレーション手動実行ガイド

## 概要

Supabase CLIが使用できない環境向けに、SupabaseダッシュボードのSQL Editorを使用してマイグレーションを手動実行する手順を説明します。

## 前提条件

- Supabaseプロジェクトへのアクセス権限

## 手順

### 1. Supabaseダッシュボードにアクセス

1. ブラウザで https://supabase.com/dashboard にアクセス
2. ログイン
3. LinkLoomプロジェクトを選択

### 2. SQL Editorを開く

1. 左サイドバーから **SQL Editor** をクリック
2. **New Query** ボタンをクリック

### 3. マイグレーションSQLを実行

以下のファイルの内容をコピーして、SQL Editorに貼り付けます：

**ファイル**: `supabase/migrations/20251006005619_initial_schema.sql`

手順：

1. ローカルの `supabase/migrations/20251006005619_initial_schema.sql` を開く
2. 全内容をコピー
3. SQL Editorに貼り付け
4. **Run** ボタンをクリック（または Cmd+Enter / Ctrl+Enter）

### 4. 実行結果の確認

成功すると以下のメッセージが表示されます：

```
Success. No rows returned
```

エラーが出た場合は、エラーメッセージを確認して対処してください。

### 5. テーブル作成の確認

1. 左サイドバーから **Table Editor** をクリック
2. 以下のテーブルが作成されていることを確認：
   - `articles`
   - `tags`
   - `platforms`
   - `article_tags`

### 6. シーディング（任意）

サンプルデータを投入する場合：

1. SQL Editorで新しいクエリを作成
2. `supabase/seed.sql` の内容をコピー＆貼り付け
3. **Run** をクリック

これにより以下のデータが投入されます：

- プラットフォームマスター: 7件（Zenn, Qiita, note, GitHub, Medium, はてなブログ, Dev.to）
- タグマスター: 20件（React, TypeScript, Next.jsなど）

### 7. RLSポリシーの確認

1. Table Editorで任意のテーブルを選択（例: `articles`）
2. 右上の **RLS** タブをクリック
3. RLSポリシーが有効化されていることを確認

期待されるポリシー（`articles`テーブルの場合）：

- `Users can view own articles`
- `Users can insert own articles`
- `Users can update own articles`
- `Users can delete own articles`

### 8. インデックスの確認（オプション）

SQL Editorで以下のクエリを実行してインデックスを確認：

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

期待されるインデックス：

- `idx_articles_user_id`
- `idx_articles_created_at`
- `idx_articles_title_fts` (GINインデックス)
- `idx_articles_bookmarked`
- `idx_article_tags_article`
- `idx_article_tags_tag`

## トラブルシューティング

### エラー: "relation already exists"

既にテーブルが存在している場合、以下のいずれかを実行：

**Option 1: テーブルを削除して再作成**

```sql
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS platforms CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
```

その後、マイグレーションSQLを再実行。

**Option 2: マイグレーションをスキップ**

既にテーブルが存在し、構造が正しい場合はスキップしてOK。

### エラー: "permission denied"

アクセス権限がない可能性があります：

1. プロジェクトの所有者であることを確認
2. Supabaseダッシュボードで正しいプロジェクトを選択していることを確認

### RLSポリシーが機能しない

1. テーブルのRLSが有効化されているか確認：

   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

2. `rowsecurity`が`true`になっていない場合、手動で有効化：
   ```sql
   ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
   ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
   ```

## 次のステップ

マイグレーションが完了したら：

1. **TypeScript型の確認**
   - `types/database.types.ts` がスキーマと一致していることを確認
   - 必要に応じて型定義を調整

2. **Supabaseクライアント設定**
   - `lib/supabase/client.ts` を作成してクライアント初期化
   - 環境変数（.env.local）が正しく設定されていることを確認

3. **動作テスト**
   - 簡単なクエリを実行してデータベース接続を確認
   - RLSポリシーが正しく機能することを確認

4. **アプリケーション開発開始**
   - 記事CRUD APIの実装
   - UIコンポーネントの作成

## 参考リンク

- [Supabase SQL Editor Documentation](https://supabase.com/docs/guides/database/sql-editor)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [実装ドキュメント](./database-schema-implementation.md)
