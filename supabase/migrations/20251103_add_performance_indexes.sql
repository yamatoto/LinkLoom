-- パフォーマンス改善のためのインデックス追加

-- articles テーブル
-- user_id と created_at の複合インデックス（検索・ソート高速化）
CREATE INDEX IF NOT EXISTS idx_articles_user_created 
ON articles(user_id, created_at DESC);

-- user_id と updated_at の複合インデックス（更新日ソート用）
CREATE INDEX IF NOT EXISTS idx_articles_user_updated 
ON articles(user_id, updated_at DESC);
