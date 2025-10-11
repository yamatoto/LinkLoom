import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* ロゴと説明 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">LinkLoom</h1>
          <p className="mt-2 text-sm text-gray-600">
            技術記事を効率的に保存・検索・管理する
          </p>
          <p className="text-sm text-gray-600">パーソナル知識管理システム</p>
        </div>

        {/* Google OAuth ログインボタン */}
        <div className="mt-8">
          <GoogleLoginButton />
        </div>

        {/* 追加情報 */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Googleアカウントでログインすることで、
          <br />
          複数デバイス間でデータを同期できます
        </p>
      </div>
    </div>
  )
}
