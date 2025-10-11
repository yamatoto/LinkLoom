'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export function GoogleLoginButton() {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()

      if (error) {
        // エラーの種類に応じた適切なメッセージを表示
        let userMessage: string
        let devDetails: string = ''

        // Google認証キャンセル（ユーザーが明示的にキャンセル）
        if (error.message?.includes('popup_closed') || error.message?.includes('user_cancelled')) {
          userMessage = '認証がキャンセルされました'
          devDetails = `[User Cancelled] ${error.message}`
        }
        // ネットワークエラー
        else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          userMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
          devDetails = `[Network Error] ${error.message} (status: ${error.status})`
        }
        // Supabase接続エラー
        else if (error.message?.includes('supabase') || error.status === 503) {
          userMessage = 'サービスに接続できません。しばらく待ってから再度お試しください。'
          devDetails = `[Supabase Connection Error] ${error.message} (status: ${error.status})`
        }
        // その他の認証エラー
        else {
          userMessage = '認証に失敗しました。もう一度お試しください。'
          devDetails = `[Auth Error] ${error.message} (status: ${error.status || 'unknown'}, name: ${error.name || 'unknown'})`
        }

        // 開発環境では詳細情報をコンソールに出力
        if (process.env.NODE_ENV === 'development') {
          logger.error('[GoogleLoginButton] Auth error details:', {
            message: error.message,
            status: error.status,
            name: error.name,
          })
          toast.error(`${userMessage}\n${devDetails}`)
        } else {
          toast.error(userMessage)
        }
        return
      }

      // OAuth成功時はリダイレクトされるため、setIsLoading(false)は実行されない
    } catch (err) {
      // 予期しないエラー（try-catchで捕捉されたもの）
      const errorMessage =
        process.env.NODE_ENV === 'development'
          ? `予期しないエラー: ${err instanceof Error ? err.message : String(err)}`
          : 'エラーが発生しました。もう一度お試しください。'

      logger.error('[GoogleLoginButton] Unexpected error:', err)

      toast.error(errorMessage)
    } finally {
      // エラー時のみsetIsLoading(false)が実行される
      // 成功時はリダイレクトされるため、このコードは到達しない
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium"
      size="lg"
    >
      {isLoading ? (
        <>
          <svg
            className="mr-2 h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          認証中...
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleでログイン
        </>
      )}
    </Button>
  )
}
