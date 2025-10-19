'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { Tag } from '@/types/article'

interface TagFilterProps {
  tags: Tag[]
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedTagIds = searchParams.get('tagIds')?.split(',').filter(Boolean) || []

  // タグ選択/選択解除の処理
  const handleToggleTag = (tagId: string) => {
    const params = new URLSearchParams(searchParams)
    const currentTags = params.get('tagIds')?.split(',').filter(Boolean) || []

    let newTags: string[]
    if (currentTags.includes(tagId)) {
      // 選択解除
      newTags = currentTags.filter((id) => id !== tagId)
    } else {
      // 選択
      newTags = [...currentTags, tagId]
    }

    if (newTags.length > 0) {
      params.set('tagIds', newTags.join(','))
    } else {
      params.delete('tagIds')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  if (tags.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        タグがありません
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">タグでフィルタ</h3>
      <div className="space-y-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center space-x-2">
            <Checkbox
              id={`tag-${tag.id}`}
              checked={selectedTagIds.includes(tag.id)}
              onCheckedChange={() => handleToggleTag(tag.id)}
            />
            <Label
              htmlFor={`tag-${tag.id}`}
              className="text-sm font-normal cursor-pointer"
            >
              {tag.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
