import { describe, it, expect } from 'vitest'
import { detectPlatform, PLATFORM_DISPLAY_NAMES, type PlatformSlug } from '@/lib/platform-detector'

/**
 * platform-detector ユニットテスト
 *
 * テスト対象: src/lib/platform-detector.ts
 *
 * テスト方針:
 * - 各プラットフォームの代表的なURL形式をテスト
 * - エッジケース（空文字、不正URL、大文字小文字）
 * - 複数パターンのあるプラットフォーム（Medium、はてなブログ）の網羅
 */

describe('detectPlatform', () => {
  describe('Zenn', () => {
    it('Zennの記事URLからzennを判定する', () => {
      const url = 'https://zenn.dev/username/articles/example-article'
      expect(detectPlatform(url)).toBe('zenn')
    })

    it('ZennのwwwプレフィックスつきURLも判定できる', () => {
      const url = 'https://www.zenn.dev/username/articles/example-article'
      expect(detectPlatform(url)).toBe('zenn')
    })

    it('Zenn本のURLも判定できる', () => {
      const url = 'https://zenn.dev/username/books/example-book'
      expect(detectPlatform(url)).toBe('zenn')
    })

    it('http://（非SSL）のZennURLも判定できる', () => {
      const url = 'http://zenn.dev/username/articles/example'
      expect(detectPlatform(url)).toBe('zenn')
    })
  })

  describe('Qiita', () => {
    it('Qiitaの記事URLからqiitaを判定する', () => {
      const url = 'https://qiita.com/username/items/abcdef1234567890'
      expect(detectPlatform(url)).toBe('qiita')
    })

    it('QiitaのwwwプレフィックスつきURLも判定できる', () => {
      const url = 'https://www.qiita.com/username/items/abcdef1234567890'
      expect(detectPlatform(url)).toBe('qiita')
    })

    it('Qiita Teamは判定しない（privateサービスのため）', () => {
      const url = 'https://example.qiita.com/items/123'
      expect(detectPlatform(url)).toBe('unknown')
    })
  })

  describe('note', () => {
    it('noteの記事URLからnoteを判定する', () => {
      const url = 'https://note.com/username/n/n123456'
      expect(detectPlatform(url)).toBe('note')
    })

    it('noteのwwwプレフィックスつきURLも判定できる', () => {
      const url = 'https://www.note.com/username/n/n123456'
      expect(detectPlatform(url)).toBe('note')
    })
  })

  describe('GitHub', () => {
    it('GitHubのリポジトリURLからgithubを判定する', () => {
      const url = 'https://github.com/user/repo'
      expect(detectPlatform(url)).toBe('github')
    })

    it('GitHubのissue URLも判定できる', () => {
      const url = 'https://github.com/user/repo/issues/123'
      expect(detectPlatform(url)).toBe('github')
    })

    it('GitHubのPull RequestURLも判定できる', () => {
      const url = 'https://github.com/user/repo/pull/456'
      expect(detectPlatform(url)).toBe('github')
    })

    it('GitHubのwwwプレフィックスつきURLも判定できる', () => {
      const url = 'https://www.github.com/user/repo'
      expect(detectPlatform(url)).toBe('github')
    })
  })

  describe('Medium', () => {
    it('Mediumの記事URLからmediumを判定する', () => {
      const url = 'https://medium.com/@username/article-title-123'
      expect(detectPlatform(url)).toBe('medium')
    })

    it('MediumのwwwプレフィックスつきURLも判定できる', () => {
      const url = 'https://www.medium.com/@username/article-title'
      expect(detectPlatform(url)).toBe('medium')
    })

    it('カスタムドメインのMedium記事も判定できる', () => {
      const url = 'https://blog.example.medium.com/article-title-123'
      expect(detectPlatform(url)).toBe('medium')
    })

    it('複数のサブドメインを持つMedium URLも判定できる', () => {
      const url = 'https://tech.company.medium.com/article-title'
      expect(detectPlatform(url)).toBe('medium')
    })
  })

  describe('はてなブログ', () => {
    it('hatenablog.comのURLからhatena-blogを判定する', () => {
      const url = 'https://example.hatenablog.com/entry/2024/01/01/article'
      expect(detectPlatform(url)).toBe('hatena-blog')
    })

    it('hatenablog.jpのURLも判定できる', () => {
      const url = 'https://example.hatenablog.jp/entry/article-title'
      expect(detectPlatform(url)).toBe('hatena-blog')
    })

    it('hateblo.jpのURLも判定できる', () => {
      const url = 'https://example.hateblo.jp/entry/article-title'
      expect(detectPlatform(url)).toBe('hatena-blog')
    })
  })

  describe('Dev.to', () => {
    it('Dev.toの記事URLからdevtoを判定する', () => {
      const url = 'https://dev.to/username/article-title-123'
      expect(detectPlatform(url)).toBe('devto')
    })

    it('Dev.toのwwwプレフィックスつきURLも判定できる', () => {
      const url = 'https://www.dev.to/username/article-title'
      expect(detectPlatform(url)).toBe('devto')
    })
  })

  describe('Unknown（不明なプラットフォーム）', () => {
    it('認識できないURLはunknownを返す', () => {
      const url = 'https://example.com/article'
      expect(detectPlatform(url)).toBe('unknown')
    })

    it('空文字列はunknownを返す', () => {
      const url = ''
      expect(detectPlatform(url)).toBe('unknown')
    })

    it('空白のみの文字列はunknownを返す', () => {
      const url = '   '
      expect(detectPlatform(url)).toBe('unknown')
    })

    it('プロトコルがないURLはunknownを返す', () => {
      const url = 'zenn.dev/username/articles/example'
      expect(detectPlatform(url)).toBe('unknown')
    })

    it('不正な形式のURLはunknownを返す', () => {
      const url = 'not-a-url'
      expect(detectPlatform(url)).toBe('unknown')
    })
  })

  describe('大文字小文字の扱い', () => {
    it('URLホスト部分の大文字小文字は無視される', () => {
      expect(detectPlatform('https://ZENN.DEV/user/articles/123')).toBe('zenn')
      expect(detectPlatform('https://Qiita.COM/user/items/123')).toBe('qiita')
      expect(detectPlatform('https://DEV.TO/user/article')).toBe('devto')
    })
  })

  describe('前後の空白', () => {
    it('URL前後の空白は無視される', () => {
      const url = '  https://zenn.dev/user/articles/example  '
      expect(detectPlatform(url)).toBe('zenn')
    })
  })
})

describe('PLATFORM_DISPLAY_NAMES', () => {
  it('すべてのプラットフォームに表示名が定義されている', () => {
    const expectedPlatforms: PlatformSlug[] = [
      'zenn',
      'qiita',
      'note',
      'github',
      'medium',
      'hatena-blog',
      'devto',
      'unknown',
    ]

    expectedPlatforms.forEach((platform) => {
      expect(PLATFORM_DISPLAY_NAMES[platform]).toBeDefined()
      expect(typeof PLATFORM_DISPLAY_NAMES[platform]).toBe('string')
      expect(PLATFORM_DISPLAY_NAMES[platform].length).toBeGreaterThan(0)
    })
  })

  it('日本語のプラットフォーム名が正しく設定されている', () => {
    expect(PLATFORM_DISPLAY_NAMES['hatena-blog']).toBe('はてなブログ')
  })

  it('英語のプラットフォーム名が正しく設定されている', () => {
    expect(PLATFORM_DISPLAY_NAMES.zenn).toBe('Zenn')
    expect(PLATFORM_DISPLAY_NAMES.qiita).toBe('Qiita')
    expect(PLATFORM_DISPLAY_NAMES.github).toBe('GitHub')
  })
})
