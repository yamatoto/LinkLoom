import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewArticleForm } from './_components/NewArticleForm'
import { Header } from '@/components/layout/Header'

/**
 * 記事登録ページ（サーバーコンポーネント）
 *
 * サーバーサイドで認証チェックを行い、未認証の場合はログインページにリダイレクト。
 * これにより、middlewareだけでなくページレベルでも保護する二重の防御を実現。
 */
export default async function NewArticlePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未認証の場合はログインページへリダイレクト
  if (!user) {
    redirect('/login?redirect=/articles/new')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新しい記事を登録</h1>
          <p className="mt-2 text-sm text-gray-600">
            URLと記事情報を入力して、記事を保存しましょう
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <NewArticleForm />
        </div>
      </main>
    </div>
  )
}
