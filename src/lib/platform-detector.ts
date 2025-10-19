/**
 * URLからプラットフォームを自動判定するユーティリティ
 */

export type PlatformSlug =
  | 'zenn'
  | 'qiita'
  | 'note'
  | 'github'
  | 'medium'
  | 'hatena-blog'
  | 'devto'
  | 'unknown'

interface PlatformPattern {
  slug: PlatformSlug
  patterns: RegExp[]
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  {
    slug: 'zenn',
    patterns: [/^https?:\/\/(www\.)?zenn\.dev\//i],
  },
  {
    slug: 'qiita',
    patterns: [/^https?:\/\/(www\.)?qiita\.com\//i],
  },
  {
    slug: 'note',
    patterns: [/^https?:\/\/(www\.)?note\.com\//i],
  },
  {
    slug: 'github',
    patterns: [/^https?:\/\/(www\.)?github\.com\//i],
  },
  {
    slug: 'medium',
    patterns: [/^https?:\/\/(www\.)?medium\.com\//i, /^https?:\/\/.*\.medium\.com\//i],
  },
  {
    slug: 'hatena-blog',
    patterns: [/^https?:\/\/.*\.hatenablog\.(com|jp)\//i, /^https?:\/\/.*\.hateblo\.jp\//i],
  },
  {
    slug: 'devto',
    patterns: [/^https?:\/\/(www\.)?dev\.to\//i],
  },
]

/**
 * URLからプラットフォームのslugを判定する
 *
 * @param url - 判定対象のURL
 * @returns プラットフォームslug（判定できない場合は'unknown'）
 *
 * @example
 * ```ts
 * detectPlatform('https://zenn.dev/user/articles/example') // 'zenn'
 * detectPlatform('https://qiita.com/user/items/example') // 'qiita'
 * detectPlatform('https://example.com/article') // 'unknown'
 * ```
 */
export function detectPlatform(url: string): PlatformSlug {
  if (!url || !url.trim()) {
    return 'unknown'
  }

  const trimmedUrl = url.trim()

  for (const { slug, patterns } of PLATFORM_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(trimmedUrl))) {
      return slug
    }
  }

  return 'unknown'
}

/**
 * プラットフォーム名の表示用マッピング
 */
export const PLATFORM_DISPLAY_NAMES: Record<PlatformSlug, string> = {
  zenn: 'Zenn',
  qiita: 'Qiita',
  note: 'note',
  github: 'GitHub',
  medium: 'Medium',
  'hatena-blog': 'はてなブログ',
  devto: 'Dev.to',
  unknown: '不明',
}
