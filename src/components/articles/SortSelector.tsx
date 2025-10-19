'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: '登録日（新しい順）' },
  { value: 'created_at-asc', label: '登録日（古い順）' },
  { value: 'updated_at-desc', label: '更新日（新しい順）' },
  { value: 'updated_at-asc', label: '更新日（古い順）' },
] as const

export function SortSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sortBy = (searchParams.get('sortBy') as 'created_at' | 'updated_at') || 'created_at'
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  const currentValue = `${sortBy}-${sortOrder}` as const

  const handleChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-')
    const params = new URLSearchParams(searchParams)

    if (newSortBy && newSortOrder) {
      params.set('sortBy', newSortBy)
      params.set('sortOrder', newSortOrder)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <Select value={currentValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="並び順を選択" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
