import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinkLoom - 記事管理システム',
  description: '技術記事を効率的に管理するためのアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
