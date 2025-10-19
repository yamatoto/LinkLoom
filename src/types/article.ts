import type { Tables } from './database.types'

/**
 * 記事データベースレコード型
 */
export type Article = Tables<'articles'>

/**
 * プラットフォームデータベースレコード型
 */
export type Platform = Tables<'platforms'>

/**
 * タグデータベースレコード型
 */
export type Tag = Tables<'tags'>

/**
 * 記事とタグの中間テーブルレコード型
 */
export type ArticleTag = Tables<'article_tags'>

/**
 * 記事一覧表示用の拡張型（プラットフォーム情報を含む）
 */
export interface ArticleWithPlatform extends Article {
  platform: Platform | null
  tags: Tag[]
}

/**
 * 記事検索パラメータ型
 */
export interface SearchParams {
  keyword?: string // キーワード検索（タイトル・説明文）
  tagIds?: string[] // タグID配列（AND条件）
  sortBy?: 'created_at' | 'updated_at' // ソート対象カラム
  sortOrder?: 'asc' | 'desc' // ソート順
}
