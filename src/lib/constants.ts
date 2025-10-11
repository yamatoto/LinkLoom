/**
 * アプリケーション全体で使用する定数
 */

/**
 * ルート定数
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
} as const

/**
 * 認証関連の定数
 */
export const AUTH = {
  DEFAULT_REDIRECT_PATH: '/',
  PUBLIC_ROUTES: ['/login', '/'] as const,
} as const

/**
 * PUBLIC_ROUTESの型を導出（型安全性向上のため）
 * '/login' | '/'
 */
export type PublicRoute = (typeof AUTH.PUBLIC_ROUTES)[number]

/**
 * 環境変数キー
 */
export const ENV_KEYS = {
  DEV_AUTH_BYPASS: 'DEV_AUTH_BYPASS',
  DEV_AUTH_EMAIL: 'DEV_AUTH_EMAIL',
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  SITE_URL: 'NEXT_PUBLIC_SITE_URL',
} as const
