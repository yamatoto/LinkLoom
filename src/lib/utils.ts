import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 条件付きクラス名をまとめ、Tailwind の競合を解決するためのユーティリティ
 * （cn = "class names"）。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
