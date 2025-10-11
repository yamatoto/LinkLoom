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

/**
 * 型ガード: unknownデータがUserMetadata型かチェック
 *
 * @param data - チェック対象のデータ
 * @returns UserMetadata型であればtrue
 */
export function isUserMetadata(data: unknown): data is UserMetadata {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  // full_nameまたはavatar_urlが存在すればUserMetadataとみなす
  return 'full_name' in data || 'avatar_url' in data
}

/**
 * UserMetadataを安全に抽出（型アサーションの代替）
 *
 * @param data - 抽出元のデータ
 * @returns 安全なUserMetadataオブジェクト
 */
export function extractUserMetadata(data: unknown): UserMetadata {
  if (!isUserMetadata(data)) {
    return {
      full_name: undefined,
      avatar_url: undefined,
    }
  }

  return data
}
