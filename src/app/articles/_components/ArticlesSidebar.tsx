import { cache } from 'react'
import { getAllTags } from '@/app/actions/articles'
import { SearchFilters } from '@/components/articles/SearchFilters'

const getCachedTags = cache(async () => {
  return await getAllTags()
})

/**
 * 記事一覧サイドバー
 * タグ一覧を取得して検索フィルタを表示
 */
export async function ArticlesSidebar() {
  const tagsResult = await getCachedTags()
  const tags = tagsResult.success ? tagsResult.tags || [] : []

  return <SearchFilters tags={tags} />
}
