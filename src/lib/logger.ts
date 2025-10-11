/**
 * アプリケーション全体で使用するLoggerユーティリティ
 * 開発環境でのみconsole出力を行い、本番環境では出力しない
 */

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * 開発環境でのみconsole.logを出力
   */
  log(...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  }

  /**
   * 開発環境でのみconsole.infoを出力
   */
  info(...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args)
    }
  }

  /**
   * 常にconsole.warnを出力（本番環境でも重要な警告は出力）
   */
  warn(...args: unknown[]): void {
    console.warn(...args)
  }

  /**
   * 常にconsole.errorを出力（本番環境でもエラーは出力）
   */
  error(...args: unknown[]): void {
    console.error(...args)
  }

  /**
   * グループ化されたログ出力（開発環境のみ）
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.group(label)
      callback()
      // eslint-disable-next-line no-console
      console.groupEnd()
    }
  }

  /**
   * テーブル形式でのログ出力（開発環境のみ）
   */
  table(data: unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.table(data)
    }
  }
}

// シングルトンインスタンスをエクスポート
export const logger = new Logger()
