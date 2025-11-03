import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PlatformIcon } from './PlatformIcon'
import type { ArticleWithPlatform } from '@/types/article'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

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
    <Card
      data-testid="article-card"
      className="flex h-full flex-col transition-all hover:shadow-lg"
    >
      <CardHeader className="flex-1">
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <PlatformIcon platform={platform} size={24} />
          <span>{formattedDate}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-1 text-gray-900 hover:text-blue-600 transition-colors"
        >
          <CardTitle className="line-clamp-2 flex-1">{title}</CardTitle>
          <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
        {description && (
          <CardDescription className="mt-2 line-clamp-3">{description}</CardDescription>
        )}
      </CardHeader>
      {tags.length > 0 && (
        <CardContent className="pt-0">
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
      <CardFooter className="mt-auto">
        <Button asChild size="sm" variant="outline">
          <Link href={`/articles/${article.id}`}>編集</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
