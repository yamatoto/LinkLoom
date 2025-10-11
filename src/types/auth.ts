/**
 * 認証関連の型定義
 */

/**
 * Supabase User型のuser_metadataの型定義
 * デフォルトのRecord<string, any>よりも型安全性を向上
 */
export interface UserMetadata {
  /** ユーザーのフルネーム (Google OAuthから取得) */
  full_name?: string
  /** ユーザーのアバターURL (Google OAuthから取得) */
  avatar_url?: string
  /** その他のメタデータフィールド (将来的な拡張用) */
  [key: string]: unknown
}
