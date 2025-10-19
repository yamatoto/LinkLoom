'use client'

import { SearchBar } from './SearchBar'
import { TagFilter } from './TagFilter'
import { SortSelector } from './SortSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FilterX } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import type { Tag } from '@/types/article'

interface SearchFiltersProps {
  tags: Tag[]
  resultCount: number
}

export function SearchFilters({ tags, resultCount }: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleClearAll = () => {
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* 検索バー */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">キーワード検索</h3>
            <SearchBar />
          </div>

          {/* ソート順選択 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">並び順</h3>
            <SortSelector />
          </div>

          {/* タグフィルタ */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <TagFilter tags={tags} />
            </div>
          )}

          {/* クリアボタン */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="w-full"
          >
            <FilterX className="mr-2 h-4 w-4" />
            すべてクリア
          </Button>
        </CardContent>
      </Card>

      {/* 検索結果件数 */}
      <div className="text-sm text-muted-foreground">
        {resultCount}件の記事が見つかりました
      </div>
    </div>
  )
}
