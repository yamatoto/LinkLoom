import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * E2Eテスト用のテストデータセットアップ
 *
 * テスト実行前にSupabase DBにサンプル記事を投入する。
 * 既存データは削除せず、テスト用データのみを追加する。
 */

interface TestArticle {
  url: string
  title: string
  description: string
  platformSlug: string
  tags?: string[]
}

const TEST_ARTICLES: TestArticle[] = [
  {
    url: 'https://zenn.dev/test-user/articles/e2e-test-1',
    title: 'Next.js 15の新機能を試してみた',
    description: 'Next.js 15で追加された新機能について解説します',
    platformSlug: 'zenn',
    tags: ['Next.js', 'React', 'TypeScript'],
  },
  {
    url: 'https://qiita.com/test-user/items/e2e-test-2',
    title: 'Supabaseで始めるバックエンド開発',
    description: 'Supabaseの基本的な使い方をまとめました',
    platformSlug: 'qiita',
    tags: ['Supabase', 'PostgreSQL'],
  },
  {
    url: 'https://note.com/test-user/n/ne2etest3',
    title: 'Vitestで快適にテストを書く',
    description: 'Vitestの便利な機能を紹介します',
    platformSlug: 'note',
    tags: ['Vitest', 'Testing'],
  },
]

export async function setupTestData(userId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase環境変数が設定されていません: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  // Service Roleキーを使用してRLSをバイパス
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🌱 テストデータのセットアップを開始...')

  // 既存のテストデータをクリーンアップ（テストURLパターンでフィルタ）
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .eq('user_id', userId)
    .like('url', '%e2e-test%')

  if (deleteError) {
    console.warn('⚠️  既存テストデータの削除中に警告:', deleteError.message)
  }

  // テスト記事を投入
  for (const article of TEST_ARTICLES) {
    // プラットフォームIDを取得
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', article.platformSlug)
      .single()

    if (platformError || !platform) {
      console.error(
        `❌ プラットフォーム取得失敗: ${article.platformSlug}`,
        platformError
      )
      continue
    }

    // 記事を投入
    const { data: insertedArticle, error: articleError } = await supabase
      .from('articles')
      .insert({
        user_id: userId,
        url: article.url,
        title: article.title,
        description: article.description,
        platform_id: platform.id,
      })
      .select('id')
      .single()

    if (articleError || !insertedArticle) {
      console.error(`❌ 記事投入失敗: ${article.title}`, articleError)
      continue
    }

    // タグを投入
    if (article.tags && article.tags.length > 0) {
      for (const tagName of article.tags) {
        // タグIDを取得（存在しない場合は作成）
        const { data: tag, error: tagError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        let tagId: string

        if (tagError || !tag) {
          // タグが存在しない場合は作成
          const { data: newTag, error: createTagError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select('id')
            .single()

          if (createTagError || !newTag) {
            console.error(`❌ タグ作成失敗: ${tagName}`, createTagError)
            continue
          }
          tagId = newTag.id
        } else {
          tagId = tag.id
        }

        // 記事とタグを紐付け
        const { error: articleTagError } = await supabase
          .from('article_tags')
          .insert({
            article_id: insertedArticle.id,
            tag_id: tagId,
          })

        if (articleTagError) {
          console.error(
            `❌ 記事タグ紐付け失敗: ${article.title} - ${tagName}`,
            articleTagError
          )
        }
      }
    }

    console.log(`✅ テスト記事を投入: ${article.title}`)
  }

  console.log('🎉 テストデータのセットアップ完了')
}

/**
 * テストデータをクリーンアップ
 */
export async function cleanupTestData(userId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🧹 テストデータのクリーンアップを開始...')

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('user_id', userId)
    .like('url', '%e2e-test%')

  if (error) {
    console.warn('⚠️  テストデータのクリーンアップ中に警告:', error.message)
  } else {
    console.log('✅ テストデータのクリーンアップ完了')
  }
}

