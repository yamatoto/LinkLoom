import { Header } from '@/components/layout/Header'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ArticleEditLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">記事を編集</h1>
          <p className="mt-2 text-sm text-gray-600">
            記事内容を更新するか、不要になった場合は削除できます。
          </p>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 space-y-2">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-300" />
            <div className="space-y-1 text-sm text-gray-500">
              <p>
                作成日: <span className="inline-block h-4 w-32 animate-pulse rounded bg-gray-200" />
              </p>
              <p>
                最終更新日:{' '}
                <span className="inline-block h-4 w-32 animate-pulse rounded bg-gray-200" />
              </p>
              <p className="break-all">
                URL: <span className="inline-block h-4 w-96 animate-pulse rounded bg-gray-200" />
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="url">
                記事URL <span className="text-red-500">*</span>
              </Label>
              <Input id="url" disabled className="mt-2" />
            </div>

            <div>
              <Label htmlFor="title">
                記事タイトル <span className="text-red-500">*</span>
              </Label>
              <Input id="title" disabled className="mt-2" />
            </div>

            <div>
              <Label htmlFor="description">説明（任意）</Label>
              <div className="mt-2 h-24 w-full animate-pulse rounded bg-gray-200" />
            </div>

            <div>
              <Label htmlFor="tags">タグ（任意、カンマ区切り）</Label>
              <Input id="tags" disabled className="mt-2" />
              <p className="mt-1 text-sm text-gray-500">※ タグ機能は現在開発中です</p>
            </div>

            <div>
              <Label htmlFor="platform">プラットフォーム</Label>
              <div className="mt-2 h-10 w-full animate-pulse rounded bg-gray-200" />
            </div>

            <div className="flex gap-3 pt-4">
              <Button disabled>記事を更新</Button>
              <Button variant="destructive" disabled>
                記事を削除
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
