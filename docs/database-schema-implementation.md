# データベーススキーマ実装ガイド

## 概要

LinkLoom Phase 1 MVPのデータベーススキーマ実装が完了しました。このドキュメントでは、実装内容とセットアップ手順を説明します。

## 実装内容

### ファイル構成

```
supabase/
├── migrations/
│   └── 20251006005619_initial_schema.sql  # 初期スキーママイグレーション
└── seed.sql                                # サンプルデータシーディング

types/
└── database.types.ts                       # TypeScript型定義
```

### データベーススキーマ

#### テーブル一覧

1. **articles** - 記事情報管理
   - 正規化された記事データ
   - URL検証（最大2048文字、http/https必須）
   - プラットフォーム・ユーザーとの外部キー関連
   - ブックマーク機能対応

2. **tags** - タグマスター
   - 正規化タグ名（name_normalized）による重複防止
   - 大文字小文字を区別しない一意性制約
   - 全認証ユーザー共有リソース

3. **platforms** - プラットフォームマスター
   - Zenn、Qiitaなどの参照元管理
   - スラッグによるURL対応
   - 正規化名による重複防止
   - 全認証ユーザー共有リソース

4. **article_tags** - 記事とタグの多対多関連
   - 複合主キー（article_id, tag_id）
   - 監査証跡としてcreated_at保持

### 主要機能

#### 1. 正規化（第3正規形）
- タグ・プラットフォームのマスター管理
- name_normalizedによる重複排除
- 外部キー制約による参照整合性保証

#### 2. Row Level Security (RLS)
- **articles**: ユーザーは自分の記事のみアクセス可能
- **tags/platforms**: 全認証ユーザーが共有
- **article_tags**: 所有記事のタグのみ操作可能

#### 3. パフォーマンス最適化
- B-treeインデックス（user_id、created_at）
- GINインデックス（日本語全文検索）
- 部分インデックス（ブックマーク済み記事）

#### 4. データ整合性
- CHECK制約（URL形式、文字列長、空文字防止）
- 外部キー制約（CASCADE/SET NULL）
- UNIQUE制約（重複防止）
- トリガー（updated_at自動更新）

## セットアップ手順

### 前提条件

- Supabaseプロジェクトが作成済み
- Supabase CLIがインストール済み（推奨）
- ローカル環境変数（.env.local）が設定済み

### 1. Supabase CLIのインストール（未インストールの場合）

```bash
# macOS
brew install supabase/tap/supabase

# npm
npm install -g supabase

# 他のOS: https://supabase.com/docs/guides/cli
```

### 2. Supabaseプロジェクトのリンク

```bash
# プロジェクトディレクトリで実行
supabase link --project-ref [YOUR_PROJECT_REF]

# プロジェクトREFはSupabaseダッシュボードのSettings > General > Reference IDで確認
```

### 3. マイグレーションの実行

```bash
# ローカル開発環境の場合
supabase db push

# または本番環境に直接適用する場合
supabase db push --db-url [DATABASE_URL]
```

### 4. シーディングの実行（任意）

```bash
# seed.sqlを実行してプラットフォーム・タグマスターデータを投入
supabase db push --seed
```

### 5. TypeScript型の生成（推奨）

```bash
# 型定義を再生成（Supabase CLIが利用可能な場合）
supabase gen types typescript --local > types/database.types.ts

# または手動で作成済みのtypes/database.types.tsを使用
```

## 使用方法

### TypeScript型の利用

```typescript
import { Database, Article, ArticleInsert, ArticleWithRelations } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントの作成
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 記事の取得（型安全）
const { data: articles, error } = await supabase
  .from('articles')
  .select('*')
  .returns<Article[]>()

// 記事の作成
const newArticle: ArticleInsert = {
  user_id: userId,
  url: 'https://example.com/article',
  title: 'サンプル記事',
  description: 'これはサンプル記事です',
  platform_id: platformId,
}

const { data, error } = await supabase
  .from('articles')
  .insert(newArticle)
  .select()
  .single()
```

### リレーション付き取得

```typescript
// 記事とプラットフォーム情報を同時取得
const { data: articles } = await supabase
  .from('articles')
  .select(`
    *,
    platform:platforms(*),
    article_tags(
      tags(*)
    )
  `)
  .returns<ArticleWithRelations[]>()
```

## 検証項目

実装後、以下の項目を確認してください：

### 1. テーブル作成確認

```sql
-- Supabaseダッシュボードまたはpsqlで実行
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 期待結果: articles, article_tags, platforms, tags
```

### 2. インデックス確認

```sql
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;
```

### 3. RLSポリシー確認

```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 4. 制約確認

```sql
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conname;
```

### 5. 機能テスト

- [ ] 記事の作成（URL検証、文字数制限）
- [ ] タグの作成（重複防止、大文字小文字正規化）
- [ ] プラットフォームの作成（重複防止）
- [ ] 記事へのタグ付け
- [ ] ブックマーク機能
- [ ] RLS動作確認（他ユーザーの記事が見えないこと）
- [ ] 全文検索（日本語）
- [ ] updated_at自動更新

## トラブルシューティング

### マイグレーションが失敗する

```bash
# マイグレーションのリセット
supabase db reset

# 再実行
supabase db push
```

### RLSポリシーが機能しない

- auth.users テーブルにユーザーが存在することを確認
- Supabaseクライアントでauth.getSession()が正しく動作することを確認
- ダッシュボードでRLSが有効化されていることを確認

### 型定義が合わない

```bash
# 最新のスキーマから型を再生成
supabase gen types typescript --local > types/database.types.ts
```

## パフォーマンス基準（Phase 1 MVP）

要件ドキュメント（Requirement 9）に基づく目標値：

| 操作 | 目標レスポンスタイム | 備考 |
|------|---------------------|------|
| 記事一覧取得 | 100ms以内 | user_idフィルタ + ソート |
| タグフィルタリング | 150ms以内 | JOINを含む |
| 記事作成 | 50ms以内 | トランザクション完了 |
| 全文検索 | 200ms以内 | GINインデックス使用 |
| ユーザー削除 | 500ms以内 | CASCADE削除含む |

**計測環境条件**:
- データベース: Supabase Free Tier または同等スペック
- ネットワーク: 50ms以下のレイテンシ
- データ状態: ウォームキャッシュ（2回目以降のクエリ）

## 次のステップ

1. **Supabaseクライアント設定**
   - `lib/supabase/client.ts` でクライアント初期化
   - `lib/supabase/server.ts` でサーバーサイドクライアント設定

2. **API実装**
   - 記事CRUD操作
   - タグ・プラットフォームマスター操作
   - 全文検索API

3. **UI実装**
   - 記事一覧表示
   - 記事登録フォーム
   - タグフィルタリング
   - ブックマーク機能

4. **テスト実装**
   - データベース操作のユニットテスト（Vitest）
   - RLS動作確認のE2Eテスト（Playwright）

## 参考リンク

- [要件ドキュメント](.kiro/specs/database-schema/requirements.md)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
