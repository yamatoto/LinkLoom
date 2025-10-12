import { AUTH } from './constants'
import { logger } from './logger'

/**
 * 認証関連のヘルパー関数
 */

/**
 * リダイレクトURLを検証し、安全なパスのみを許可する
 * Open Redirect脆弱性（CWE-601）を防ぐ
 *
 * @param redirectParam - クエリパラメータから取得したredirect値
 * @param defaultPath - 不正なパスの場合のデフォルトパス
 * @returns 検証済みの安全なパス
 */
export function validateRedirectPath(
  redirectParam: string | null,
  defaultPath: string = AUTH.DEFAULT_REDIRECT_PATH
): string {
  if (!redirectParam) {
    return defaultPath
  }

  // 内部パスのみ許可（相対パス）
  // "//" で始まるパスは外部URL（//evil.com）なので拒否
  if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
    return redirectParam
  }

  // 外部URLや不正なパスは拒否してデフォルトにフォールバック
  logger.warn('[auth-helpers] Invalid redirect path rejected:', redirectParam)
  return defaultPath
}
