-- LinkLoom Phase 1 MVP Database Schema
-- 正規化されたデータベーススキーマ（第3正規形）
-- PostgreSQL + Supabase RLS

-- =============================================================================
-- テーブル定義
-- =============================================================================

-- tagsテーブル: タグマスター管理（依存なし、最初に作成）
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED UNIQUE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT tags_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT tags_name_unique UNIQUE (name)
);

COMMENT ON TABLE tags IS 'タグマスター管理テーブル（正規化・重複防止）';
COMMENT ON COLUMN tags.id IS 'タグID（UUID）';
COMMENT ON COLUMN tags.name IS 'タグ名（表示用）';
COMMENT ON COLUMN tags.name_normalized IS '正規化タグ名（検索用、小文字・トリム済み）';
COMMENT ON COLUMN tags.created_at IS '作成日時（UTC）';

-- platformsテーブル: プラットフォームマスター管理（依存なし）
CREATE TABLE platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (LOWER(TRIM(name))) STORED UNIQUE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT platforms_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT platforms_slug_not_empty CHECK (LENGTH(TRIM(slug)) > 0),
  CONSTRAINT platforms_name_unique UNIQUE (name),
  CONSTRAINT platforms_slug_unique UNIQUE (slug)
);

COMMENT ON TABLE platforms IS 'プラットフォームマスター管理テーブル（Zenn、Qiitaなど）';
COMMENT ON COLUMN platforms.id IS 'プラットフォームID（UUID）';
COMMENT ON COLUMN platforms.name IS 'プラットフォーム名（表示用）';
COMMENT ON COLUMN platforms.slug IS 'プラットフォームスラッグ（URL用）';
COMMENT ON COLUMN platforms.name_normalized IS '正規化プラットフォーム名（検索用）';
COMMENT ON COLUMN platforms.created_at IS '作成日時（UTC）';

-- articlesテーブル: 記事情報の管理（platformsに依存）
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

COMMENT ON TABLE articles IS '記事情報を管理するテーブル';
COMMENT ON COLUMN articles.id IS '記事ID（UUID）';
COMMENT ON COLUMN articles.user_id IS 'ユーザーID（auth.users外部キー）';
COMMENT ON COLUMN articles.url IS '記事URL（最大2048文字、http/https必須）';
COMMENT ON COLUMN articles.title IS '記事タイトル';
COMMENT ON COLUMN articles.description IS '記事概要（最大5000文字）';
COMMENT ON COLUMN articles.platform_id IS 'プラットフォームID（platforms外部キー）';
COMMENT ON COLUMN articles.is_bookmarked IS 'ブックマーク状態';
COMMENT ON COLUMN articles.created_at IS '作成日時（UTC）';
COMMENT ON COLUMN articles.updated_at IS '更新日時（UTC）';

-- article_tagsテーブル: 記事とタグの多対多関連
CREATE TABLE article_tags (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (article_id, tag_id)
);

COMMENT ON TABLE article_tags IS '記事とタグの多対多関連テーブル';
COMMENT ON COLUMN article_tags.article_id IS '記事ID（articles外部キー）';
COMMENT ON COLUMN article_tags.tag_id IS 'タグID（tags外部キー）';
COMMENT ON COLUMN article_tags.created_at IS '関連付け日時（監査証跡）';

-- =============================================================================
-- トリガー: updated_at自動更新
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'updated_atカラムを自動更新するトリガー関数';

CREATE TRIGGER articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

COMMENT ON TRIGGER articles_updated_at ON articles IS '記事更新時にupdated_atを自動更新';

-- =============================================================================
-- インデックス: パフォーマンス最適化
-- =============================================================================

-- articlesテーブルのインデックス
CREATE INDEX idx_articles_user_id ON articles(user_id);
COMMENT ON INDEX idx_articles_user_id IS 'ユーザー別記事一覧の高速化';

CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
COMMENT ON INDEX idx_articles_created_at IS '日時ソートの高速化';

CREATE INDEX idx_articles_title_fts ON articles USING gin(to_tsvector('simple', title));
COMMENT ON INDEX idx_articles_title_fts IS 'タイトル全文検索の高速化（GINインデックス）';

CREATE INDEX idx_articles_bookmarked ON articles(user_id, is_bookmarked) WHERE is_bookmarked = true;
COMMENT ON INDEX idx_articles_bookmarked IS 'ブックマーク済み記事の高速検索（部分インデックス）';

-- article_tagsテーブルのインデックス
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
COMMENT ON INDEX idx_article_tags_article IS '記事からタグ検索の高速化';

CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
COMMENT ON INDEX idx_article_tags_tag IS 'タグから記事検索の高速化';

-- =============================================================================
-- Row Level Security (RLS): マルチテナント対応
-- =============================================================================

-- articlesテーブル: 自分の記事のみアクセス可能
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

COMMENT ON POLICY "Users can view own articles" ON articles IS 'ユーザーは自分の記事のみ閲覧可能';
COMMENT ON POLICY "Users can insert own articles" ON articles IS 'ユーザーは自分の記事のみ作成可能';
COMMENT ON POLICY "Users can update own articles" ON articles IS 'ユーザーは自分の記事のみ更新可能';
COMMENT ON POLICY "Users can delete own articles" ON articles IS 'ユーザーは自分の記事のみ削除可能';

-- tagsテーブル: 共有マスター（全認証ユーザーがアクセス可能）
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all tags"
ON tags FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert tags"
ON tags FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tags"
ON tags FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tags"
ON tags FOR DELETE
USING (auth.role() = 'authenticated');

COMMENT ON POLICY "Authenticated users can view all tags" ON tags IS '認証済みユーザーは全タグ閲覧可能';
COMMENT ON POLICY "Authenticated users can insert tags" ON tags IS '認証済みユーザーはタグ作成可能';
COMMENT ON POLICY "Authenticated users can update tags" ON tags IS '認証済みユーザーはタグ更新可能';
COMMENT ON POLICY "Authenticated users can delete tags" ON tags IS '認証済みユーザーはタグ削除可能';

-- platformsテーブル: 共有マスター（全認証ユーザーがアクセス可能）
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all platforms"
ON platforms FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert platforms"
ON platforms FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update platforms"
ON platforms FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete platforms"
ON platforms FOR DELETE
USING (auth.role() = 'authenticated');

COMMENT ON POLICY "Authenticated users can view all platforms" ON platforms IS '認証済みユーザーは全プラットフォーム閲覧可能';
COMMENT ON POLICY "Authenticated users can insert platforms" ON platforms IS '認証済みユーザーはプラットフォーム作成可能';
COMMENT ON POLICY "Authenticated users can update platforms" ON platforms IS '認証済みユーザーはプラットフォーム更新可能';
COMMENT ON POLICY "Authenticated users can delete platforms" ON platforms IS '認証済みユーザーはプラットフォーム削除可能';

-- article_tagsテーブル: 所有する記事に対してのみタグ操作可能
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own article tags"
ON article_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM articles
    WHERE articles.id = article_tags.article_id
    AND articles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own article tags"
ON article_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM articles
    WHERE articles.id = article_tags.article_id
    AND articles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own article tags"
ON article_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM articles
    WHERE articles.id = article_tags.article_id
    AND articles.user_id = auth.uid()
  )
);

COMMENT ON POLICY "Users can view own article tags" ON article_tags IS 'ユーザーは自分の記事のタグのみ閲覧可能';
COMMENT ON POLICY "Users can insert own article tags" ON article_tags IS 'ユーザーは自分の記事にのみタグ追加可能';
COMMENT ON POLICY "Users can delete own article tags" ON article_tags IS 'ユーザーは自分の記事のタグのみ削除可能';
