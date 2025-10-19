import type { Platform } from '@/types/article'

interface PlatformIconProps {
  platform: Platform | null
  size?: number
}

/**
 * プラットフォームのアイコンを表示するコンポーネント
 *
 * 各プラットフォームのブランドカラーとアイコンを表示
 */
export function PlatformIcon({ platform, size = 20 }: PlatformIconProps) {
  if (!platform) {
    return (
      <div
        className="flex items-center justify-center rounded bg-gray-100 text-gray-500"
        style={{ width: size, height: size }}
        aria-label="Unknown platform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-full h-full p-0.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
      </div>
    )
  }

  const { slug, name } = platform

  // プラットフォームごとの色設定
  const colorMap: Record<string, string> = {
    zenn: 'bg-[#3EA8FF] text-white',
    qiita: 'bg-[#55C500] text-white',
    note: 'bg-[#41C9B4] text-white',
    github: 'bg-[#24292F] text-white',
    medium: 'bg-[#000000] text-white',
    hatena: 'bg-[#00A4DE] text-white',
    devto: 'bg-[#0A0A0A] text-white',
  }

  const colorClass = colorMap[slug] || 'bg-gray-200 text-gray-700'

  // 最初の文字を大文字で表示（アイコンの代わり）
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`flex items-center justify-center rounded font-bold ${colorClass}`}
      style={{ width: size, height: size, fontSize: size * 0.6 }}
      aria-label={`${name} platform`}
      title={name}
    >
      {initial}
    </div>
  )
}
