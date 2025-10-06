-- LinkLoom Sample Data Seed
-- 開発・テスト用のサンプルデータ

-- =============================================================================
-- プラットフォームマスターデータ
-- =============================================================================

INSERT INTO platforms (name, slug) VALUES
  ('Zenn', 'zenn'),
  ('Qiita', 'qiita'),
  ('note', 'note'),
  ('GitHub', 'github'),
  ('Medium', 'medium'),
  ('はてなブログ', 'hatena-blog'),
  ('Dev.to', 'devto')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- タグマスターデータ
-- =============================================================================

INSERT INTO tags (name) VALUES
  ('React'),
  ('TypeScript'),
  ('Next.js'),
  ('Node.js'),
  ('JavaScript'),
  ('Supabase'),
  ('PostgreSQL'),
  ('CSS'),
  ('Tailwind CSS'),
  ('Vitest'),
  ('Playwright'),
  ('Testing'),
  ('Architecture'),
  ('Performance'),
  ('Security'),
  ('DevOps'),
  ('Git'),
  ('Docker'),
  ('AWS'),
  ('Firebase')
ON CONFLICT (name_normalized) DO NOTHING;

-- =============================================================================
-- サンプル記事データ
-- Note: 実際のuser_idは認証ユーザーのUUIDに置き換える必要があります
-- テスト時は適切なuser_idを使用してください
-- =============================================================================

-- サンプル記事の挿入例（user_idは実際の値に置き換えてください）
-- INSERT INTO articles (user_id, url, title, description, platform_id) VALUES
--   (
--     '[YOUR_USER_ID_HERE]',
--     'https://zenn.dev/example/articles/getting-started-nextjs',
--     'Next.js 15 入門ガイド',
--     'Next.js 15の新機能と使い方を解説する入門記事です。',
--     (SELECT id FROM platforms WHERE slug = 'zenn')
--   );

-- サンプル記事へのタグ付け例
-- INSERT INTO article_tags (article_id, tag_id) VALUES
--   (
--     '[ARTICLE_ID_HERE]',
--     (SELECT id FROM tags WHERE name = 'Next.js')
--   );

COMMENT ON TABLE platforms IS 'プラットフォームマスターデータは共有リソースとして事前投入済み';
COMMENT ON TABLE tags IS 'タグマスターデータは共有リソースとして事前投入済み';
