'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')

  // URL Search Paramsを更新する関数
  const updateSearchParams = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set('keyword', value)
      } else {
        params.delete('keyword')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  // debounce処理（300ms）
  const debouncedUpdate = useDebouncedCallback(updateSearchParams, 300)

  // キーワード変更時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    debouncedUpdate(value)
  }

  // クリアボタン
  const handleClear = () => {
    setKeyword('')
    updateSearchParams('')
  }

  // URLパラメータが外部から変更された場合の同期
  useEffect(() => {
    const urlKeyword = searchParams.get('keyword') || ''
    setKeyword(urlKeyword)
  }, [searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="記事を検索..."
        value={keyword}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {keyword && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
          aria-label="検索をクリア"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
