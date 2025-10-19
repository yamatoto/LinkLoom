import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  throw new Error(
    `Supabaseの環境変数が設定されていません: ${missingVars.join(', ')}\n` +
      '.env.localファイルを確認してください。'
  )
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
