import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlatformIcon } from './PlatformIcon'
import type { ArticleWithPlatform } from '@/types/article'

interface ArticleCardProps {
  article: ArticleWithPlatform
}

/**
 * 記事カードコンポーネント
 *
 * 記事の概要情報を表示するカード
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const { url, title, description, platform, tags, created_at } = article

  // 日付フォーマット（例: 2025-10-19）
  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : ''

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <PlatformIcon platform={platform} size={24} />
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          <CardTitle className="line-clamp-2">{title}</CardTitle>
          {description && (
            <CardDescription className="line-clamp-3">{description}</CardDescription>
          )}
        </CardHeader>
        {tags.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
