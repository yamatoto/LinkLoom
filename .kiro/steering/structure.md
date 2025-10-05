# LinkLoom - Project Structure

## ルートディレクトリ構成

```
LinkLoom/
├── .kiro/                    # 仕様駆動開発（Kiro）
│   ├── specs/               # 機能仕様（spec-init で管理）
│   └── steering/            # プロジェクト全体コンテキスト（本ファイル）
├── .claude/                 # Claude Code設定
│   └── commands/            # カスタムスラッシュコマンド
├── app/                     # Next.js App Router
│   ├── (auth)/             # 認証関連ルート
│   ├── (dashboard)/        # メインアプリケーション
│   ├── api/                # API Routes
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # トップページ
├── components/              # Reactコンポーネント
│   ├── ui/                 # shadcn/ui コンポーネント
│   ├── features/           # 機能別コンポーネント
│   └── layouts/            # レイアウトコンポーネント
├── lib/                     # ユーティリティとヘルパー
│   ├── supabase/           # Supabase関連
│   ├── hooks/              # カスタムフック
│   └── utils/              # ユーティリティ関数
├── types/                   # TypeScript型定義
├── public/                  # 静的ファイル
├── tests/                   # テストファイル
│   ├── unit/               # Vitestユニットテスト
│   └── e2e/                # Playwright E2Eテスト
├── supabase/                # Supabaseローカル開発
│   └── migrations/         # データベースマイグレーション
├── docs/                    # プロジェクトドキュメント
├── .env.local              # 環境変数（Gitignore）
├── .env.example            # 環境変数テンプレート
├── next.config.js          # Next.js設定
├── tailwind.config.ts      # Tailwind CSS設定
├── tsconfig.json           # TypeScript設定
├── package.json            # 依存関係
├── README.md               # プロジェクト概要
└── CLAUDE.md               # Claude Code開発ガイド
```

---

## 詳細ディレクトリ構造

### `/app` - Next.js App Router

```
app/
├── (auth)/                  # 認証グループルート
│   ├── login/
│   │   └── page.tsx        # ログインページ
│   └── layout.tsx          # 認証レイアウト
│
├── (dashboard)/             # メインアプリグループルート
│   ├── articles/           # 記事関連
│   │   ├── page.tsx        # 記事一覧ページ
│   │   ├── [id]/
│   │   │   └── page.tsx    # 記事詳細ページ
│   │   └── new/
│   │       └── page.tsx    # 記事登録ページ
│   └── layout.tsx          # ダッシュボードレイアウト
│
├── api/                     # API Routes
│   ├── articles/
│   │   ├── route.ts        # 記事CRUD
│   │   └── [id]/
│   │       └── route.ts
│   └── fetch-metadata/
│       └── route.ts        # URLメタデータ取得
│
├── layout.tsx               # ルートレイアウト（共通ヘッダー・フッター）
├── page.tsx                 # トップページ（リダイレクト or ランディング）
├── globals.css              # グローバルCSS
└── providers.tsx            # Context Providers（TanStack Query等）
```

### `/components` - Reactコンポーネント

```
components/
├── ui/                      # shadcn/ui基本コンポーネント
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── badge.tsx
│   └── ...
│
├── features/                # 機能別コンポーネント
│   ├── articles/
│   │   ├── ArticleCard.tsx         # 記事カード
│   │   ├── ArticleList.tsx         # 記事一覧
│   │   ├── ArticleForm.tsx         # 記事登録・編集フォーム
│   │   ├── ArticleSearch.tsx       # 検索バー
│   │   └── ArticleFilters.tsx      # フィルタUI
│   │
│   ├── auth/
│   │   ├── LoginButton.tsx         # Googleログインボタン
│   │   └── AuthProvider.tsx        # 認証コンテキスト
│   │
│   └── tags/
│       ├── TagList.tsx             # タグ一覧
│       └── TagInput.tsx            # タグ入力
│
└── layouts/                 # レイアウトコンポーネント
    ├── Header.tsx           # ヘッダー
    ├── Sidebar.tsx          # サイドバー（フィルタ）
    └── Footer.tsx           # フッター
```

### `/lib` - ユーティリティとヘルパー

```
lib/
├── supabase/
│   ├── client.ts            # Supabaseクライアント（ブラウザ）
│   ├── server.ts            # Supabaseクライアント（サーバー）
│   ├── queries.ts           # データベースクエリ関数
│   └── auth.ts              # 認証ヘルパー
│
├── hooks/
│   ├── useArticles.ts       # 記事データフェッチフック
│   ├── useFilters.ts        # フィルタ状態管理フック
│   ├── useAuth.ts           # 認証状態フック
│   └── useDebounce.ts       # デバウンスフック
│
├── utils/
│   ├── cn.ts                # className結合（Tailwind用）
│   ├── formatters.ts        # 日付・数値フォーマット
│   └── validators.ts        # バリデーション関数
│
└── constants.ts             # 定数定義（難易度、プラットフォーム等）
```

### `/types` - TypeScript型定義

```
types/
├── supabase.ts              # Supabase自動生成型
├── article.ts               # 記事関連型
├── user.ts                  # ユーザー関連型
└── index.ts                 # 型のエクスポート
```

### `/tests` - テスト

```
tests/
├── unit/
│   ├── utils.test.ts        # ユーティリティ関数テスト
│   ├── hooks.test.ts        # カスタムフックテスト
│   └── components.test.tsx  # コンポーネントテスト
│
└── e2e/
    ├── auth.spec.ts         # 認証フロー
    ├── articles.spec.ts     # 記事CRUD
    └── search.spec.ts       # 検索・フィルタリング
```

### `/supabase` - Supabaseローカル開発

```
supabase/
├── migrations/
│   ├── 20250105_create_articles.sql
│   └── 20250105_setup_rls.sql
├── seed.sql                 # テストデータ
└── config.toml              # Supabase設定
```

---

## コード組織化パターン

### ファイル命名規則
- **コンポーネント**: PascalCase（例: `ArticleCard.tsx`）
- **ユーティリティ**: camelCase（例: `formatDate.ts`）
- **型定義**: PascalCase（例: `Article.ts`）
- **テスト**: `*.test.ts` or `*.spec.ts`
- **API Routes**: `route.ts`（Next.js規約）

### インポート順序
```typescript
// 1. 外部ライブラリ
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// 2. 内部コンポーネント
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/features/articles/ArticleCard'

// 3. ユーティリティ・フック
import { useArticles } from '@/lib/hooks/useArticles'
import { cn } from '@/lib/utils/cn'

// 4. 型定義
import type { Article } from '@/types/article'

// 5. スタイル
import './styles.css'
```

### パスエイリアス（`tsconfig.json`）
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/types/*": ["types/*"]
    }
  }
}
```

---

## アーキテクチャ原則

### 1. Feature-Based Organization
機能ごとにコンポーネントを分割（例: `features/articles/`, `features/auth/`）

### 2. Separation of Concerns
- **UI層**: `components/` - 見た目とユーザー操作
- **ロジック層**: `lib/hooks/` - ビジネスロジック
- **データ層**: `lib/supabase/` - データアクセス

### 3. Server vs Client Components
- **Server Components**: デフォルト（データフェッチ、SEO）
- **Client Components**: 'use client'（インタラクション、状態管理）

### 4. API Route設計
```typescript
// RESTful設計
GET    /api/articles          # 一覧取得
POST   /api/articles          # 新規作成
GET    /api/articles/[id]     # 詳細取得
PATCH  /api/articles/[id]     # 更新
DELETE /api/articles/[id]     # 削除
```

---

## 状態管理パターン

### クライアント状態（Zustand）
```typescript
// lib/store/filterStore.ts
import { create } from 'zustand'

interface FilterState {
  searchKeyword: string
  selectedTags: string[]
  difficulties: string[]
  setSearchKeyword: (keyword: string) => void
  // ...
}
```

### サーバー状態（TanStack Query）
```typescript
// lib/hooks/useArticles.ts
import { useQuery } from '@tanstack/react-query'

export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  })
}
```

---

## 設定ファイル

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['xxx.supabase.co'], // Supabaseストレージ
  },
}

module.exports = nextConfig
```

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## Git管理

### `.gitignore`
```
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env.local
.env*.local

# Testing
coverage/

# Misc
.DS_Store
```

---

**最終更新**: 2025-10-05
**現在フェーズ**: Phase 1設計完了、実装準備中
