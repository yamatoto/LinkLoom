# Requirements Document

## Introduction

LinkLoomプロジェクトのPhase 1 MVPにおける正規化データベーススキーマ設計の要件定義です。本スキーマは、技術記事の保存・検索・管理システムの基盤となるデータベース構造を提供します。

PostgreSQLの第3正規形を維持し、データ整合性を保証しながら、パフォーマンスとセキュリティを両立させることで、個人利用からチーム利用（10人以下）へのスケーラビリティを確保します。

**ビジネス価値:**

- データ整合性の保証（タグ・プラットフォームの一貫性、重複排除）
- 高速な検索・フィルタリング性能（適切なインデックス設計）
- セキュアなマルチテナント対応（RLSによるデータ分離）
- 将来の機能拡張への対応力（正規化されたスキーマ設計）
- プラットフォーム別統計の容易な取得（正規化されたplatformsマスター）

---

## Requirements

### Requirement 1: 記事情報の正規化スキーマ設計

**目的**: 記事情報を第3正規形で管理し、データの重複を排除し、更新時の一貫性を保証する

#### テーブル定義: articles

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PRIMARY KEY | 記事ID |
| user_id | uuid | NOT NULL, FK → auth.users | ユーザーID |
| url | text | NOT NULL | 記事URL |
| title | text | NOT NULL | 記事タイトル |
| description | text | NULL | 記事概要 |
| platform_id | uuid | FK → platforms.id | プラットフォームID |
| is_bookmarked | boolean | DEFAULT false | ブックマーク状態 |
| created_at | timestamptz | DEFAULT now() | 作成日時（UTC） |
| updated_at | timestamptz | DEFAULT now() | 更新日時（UTC） |

#### 制約

- **URL検証**: http:// または https:// で始まる、最大2048文字
- **外部キー**:
  - user_id → auth.users (ON DELETE CASCADE)
  - platform_id → platforms.id (ON DELETE SET NULL)
- **自動更新**: updated_at は更新時に自動的に現在時刻に更新（トリガー使用）

---

### Requirement 2: タグマスター管理スキーマ

**目的**: タグの一貫性を保証し、効率的な検索を可能にする。大文字小文字を区別せず重複を防ぐ。

#### テーブル定義: tags

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PRIMARY KEY | タグID |
| name | text | NOT NULL, UNIQUE | タグ名（表示用） |
| name_normalized | text | GENERATED, UNIQUE | 正規化タグ名（検索用） |
| created_at | timestamptz | DEFAULT now() | 作成日時（UTC） |

#### 制約

- **正規化カラム**: `name_normalized = LOWER(TRIM(name))` で自動生成
- **重複防止**: name_normalized にUNIQUE制約（"React" と "react" は重複とみなす）
- **空文字列禁止**: CHECK (LENGTH(TRIM(name)) > 0)
- **削除時**: タグ削除時、article_tags の関連レコードも削除（CASCADE）

---

### Requirement 3: プラットフォームマスター管理スキーマ

**目的**: 記事の参照元プラットフォーム（Zenn、Qiitaなど）を正規化して管理し、統計情報の取得を容易にする

#### テーブル定義: platforms

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PRIMARY KEY | プラットフォームID |
| name | text | NOT NULL, UNIQUE | プラットフォーム名（表示用） |
| slug | text | NOT NULL, UNIQUE | プラットフォームスラッグ（URL用） |
| name_normalized | text | GENERATED, UNIQUE | 正規化プラットフォーム名 |
| created_at | timestamptz | DEFAULT now() | 作成日時（UTC） |

#### 制約

- **正規化カラム**: `name_normalized = LOWER(TRIM(name))` で自動生成
- **重複防止**: name_normalized にUNIQUE制約（"GitHub" と "github" は重複とみなす）
- **空文字列禁止**: CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(TRIM(slug)) > 0)
- **削除時**: プラットフォーム削除時、articles.platform_id を NULL に設定（SET NULL）
- **共有マスター**: すべての認証済みユーザーがSELECT/INSERT/UPDATE/DELETE可能（RLSポリシー）

---

### Requirement 4: 記事とタグの多対多関連

**目的**: 1つの記事に複数のタグを付与でき、1つのタグを複数の記事で使用できる

#### テーブル定義: article_tags

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| article_id | uuid | FK → articles.id | 記事ID |
| tag_id | uuid | FK → tags.id | タグID |
| created_at | timestamptz | DEFAULT now() | 関連付け日時（監査証跡） |

#### 制約

- **複合主キー**: (article_id, tag_id)
- **外部キー**:
  - article_id → articles.id (ON DELETE CASCADE)
  - tag_id → tags.id (ON DELETE CASCADE)

---

### Requirement 5: Row Level Security (RLS) ポリシー

**目的**: マルチテナント環境でユーザーが自分のデータのみにアクセスできるよう制御し、データ漏洩を防ぐ

#### articlesテーブル

- **SELECT/INSERT/UPDATE/DELETE**: 自分の user_id と一致する記事のみ操作可能
- **未認証ユーザー**: すべての操作を拒否

#### tags/platformsテーブル（共有マスター）

- **SELECT**: すべての認証済みユーザーに許可
- **INSERT/UPDATE/DELETE**: すべての認証済みユーザーに許可

#### article_tagsテーブル

- **操作権限**: 所有する記事に対してのみタグの関連付け/解除が可能（RLSはarticles経由で制御）

---

### Requirement 6: インデックス最適化

**目的**: 頻繁に実行されるクエリのパフォーマンスを最適化し、記事一覧表示や検索処理を高速化

#### インデックス一覧

**articlesテーブル**
- `idx_articles_user_id`: B-tree (user_id) - ユーザー別記事一覧
- `idx_articles_created_at`: B-tree (created_at DESC) - 日時ソート
- `idx_articles_title_fts`: GIN (to_tsvector('japanese', title)) - 全文検索
- `idx_articles_bookmarked`: Partial B-tree (user_id, is_bookmarked) WHERE is_bookmarked = true - ブックマーク済み記事

**article_tagsテーブル**
- `idx_article_tags_article`: B-tree (article_id) - 記事からタグ検索
- `idx_article_tags_tag`: B-tree (tag_id) - タグから記事検索

**tags/platformsテーブル**
- name, slug の UNIQUE 制約により自動的にインデックス作成

#### 全文検索仕様

- **言語設定**: 日本語（'japanese' 辞書）
- **インデックス**: `to_tsvector('japanese', title)`
- **検索クエリ**: `to_tsquery('japanese', search_term)`

---

### Requirement 7: データ整合性制約

**目的**: データベース層でデータの整合性を保証し、アプリケーション層のバグによる不正データを防ぐ

#### 必須項目（NOT NULL）

- articles: id, user_id, url, title
- tags: id, name
- platforms: id, name, slug

#### CHECK制約

- articles.url: 最大2048文字、http:// または https:// で始まる
- articles.description: 最大5000文字（推奨）
- tags.name: 空文字列・空白のみ禁止 `LENGTH(TRIM(name)) > 0`
- platforms.name, slug: 空文字列禁止

#### 外部キー制約

- 存在しない article_id, tag_id, platform_id の挿入時はエラー
- ユーザー削除時: articles が CASCADE 削除
- プラットフォーム削除時: articles.platform_id が NULL に設定

---

### Requirement 8: タイムスタンプ管理

**目的**: レコードの作成日時と更新日時を自動的に管理し、監査証跡とデータ追跡を容易にする

#### 自動設定

- **created_at**: すべてのテーブルで作成時に自動設定（now()）
- **updated_at**: articles テーブルで更新時に自動更新（トリガー使用）
- **タイムゾーン**: すべて UTC (timestamptz)

---

### Requirement 9: パフォーマンス要件

**目的**: Phase 1 MVPでの使用を想定したパフォーマンス基準を満たし、個人利用（50記事以下）で快適な操作性を保証する

#### 計測環境条件

- **データベース**: Supabase Free Tier または同等スペック
- **ネットワーク**: 50ms以下のレイテンシ
- **クライアント**: モダンブラウザ（Chrome最新版）
- **データ状態**: ウォームキャッシュ（2回目以降のクエリ）

#### パフォーマンス目標（記事数50件以下）

| 操作 | 目標レスポンスタイム | 備考 |
|------|---------------------|------|
| 記事一覧取得 | 100ms以内 | user_id でフィルタ + ソート |
| タグフィルタリング | 150ms以内 | JOIN を含む |
| 記事作成 | 50ms以内 | トランザクション完了 |
| 全文検索 | 200ms以内 | GINインデックス使用 |
| ユーザー削除 | 500ms以内 | CASCADE削除含む |

#### 検証方法

- パフォーマンス基準未達時は `EXPLAIN ANALYZE` でクエリプランを確認
- インデックス使用状況を検証

---

### Requirement 10: スケーラビリティ考慮

**目的**: Phase 3（チーム利用：10人）への将来的な拡張を考慮した設計により、データ量増加時の再設計コストを削減

#### スケーラビリティ目標

- **ユーザー数**: 10人
- **記事数**: 1,000件（1人あたり100記事）
- **タグ数**: 500件
- **article_tags**: 5,000件

#### 設計方針

- インデックスにより上記規模でパフォーマンス維持
- RLS ポリシーにより複数ユーザーのデータを適切に分離
- 拡張時に既存テーブルを変更せず新テーブル追加で対応可能（例: Phase 2のメモ機能）

---

### Requirement 11: 型定義とドキュメント

**目的**: TypeScriptでの型安全なデータアクセスを実現し、コンパイル時の型チェックとエディタ補完を活用

#### TypeScript型定義

- **生成方法**: Supabase CLI (`supabase gen types typescript`)
- **含まれる型**: articles, tags, platforms, article_tags の全カラム
- **操作別型**: Row, Insert, Update
- **リレーションシップ情報**: articles.platform_id → platforms.id など

#### ドキュメント

- テーブル・カラムのコメント: 日本語で説明を記述
- マイグレーションファイル: 可読性の高いコメントとセクション区切り

---

### Requirement 12: トランザクション制御とデータ一貫性

**目的**: 複数テーブルにまたがる操作のトランザクション分離レベルを適切に設定し、同時実行時のデータ競合を防ぐ

#### トランザクション設定

- **分離レベル**: READ COMMITTED（PostgreSQLデフォルト）
- **ACID原則**: 記事作成 + article_tags 挿入は両方成功するか両方失敗
- **エラーハンドリング**: トランザクション中のエラーで全変更をロールバック

#### 同時実行制御

- **UNIQUE制約**: 複数ユーザーが同じタグを同時作成 → 1つだけ成功
- **デッドロック検出**: PostgreSQL自動検出により1つのトランザクションをアボート
- **Supabase RPC関数**: 明示的なトランザクション境界（BEGIN/COMMIT/ROLLBACK）を使用

---

## 実装時の参考DDL例

```sql
-- articlesテーブル
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL CHECK (LENGTH(url) <= 2048 AND url ~ '^https?://'),
  title text NOT NULL,
  description text CHECK (LENGTH(description) <= 5000),
  platform_id uuid REFERENCES platforms(id) ON DELETE SET NULL,
  is_bookmarked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- tagsテーブル
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED UNIQUE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT tags_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- platformsテーブル
CREATE TABLE platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED UNIQUE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT platforms_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT platforms_slug_not_empty CHECK (LENGTH(TRIM(slug)) > 0)
);

-- article_tagsテーブル
CREATE TABLE article_tags (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (article_id, tag_id)
);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- インデックス
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_title_fts ON articles USING gin(to_tsvector('japanese', title));
CREATE INDEX idx_articles_bookmarked ON articles(user_id, is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);

-- RLSポリシー（articlesテーブル例）
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own articles"
ON articles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own articles"
ON articles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own articles"
ON articles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles"
ON articles FOR DELETE
USING (auth.uid() = user_id);
```
