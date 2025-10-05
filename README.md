# LinkLoom

技術記事を効率的に保存・検索・管理するパーソナル知識管理システム

## 📖 概要

LinkLoomは、散在する技術情報を一元管理し、必要な時に素早くアクセスできる環境を提供します。note、Qiita、Zennなど複数のプラットフォームの記事をタグで分類し、キーワード検索で目的の記事を即座に見つけられます。

### 解決する課題
- 気になった技術記事を後で見つけられない
- 複数のプラットフォーム（note, Qiita, Zenn等）に記事が散在
- 記事の分類・整理ができない
- 学習進捗や理解度の管理ができない

## ✨ 主な機能

### Phase 1: MVP（最小実装） - 現在開発中
- ✅ **記事管理**
  - 手動登録（URL, タイトル, 説明, タグ）
  - 編集・削除・アーカイブ
  - プラットフォーム対応: note, Qiita, Zenn, はてぶ, ドクセル, 海外記事等

- ✅ **検索・フィルタリング**
  - キーワード検索（タイトル・説明文）
  - タグフィルタ（複数選択、AND条件）
  - ソート順: 登録順

- ✅ **記事表示**
  - カード形式一覧表示
  - 表示情報: プラットフォームアイコン、タイトル、説明、タグ、投稿日
  - ブックマーク機能

- ✅ **認証・同期**
  - Googleログイン
  - 複数デバイス間でデータ同期

### Phase 2: 機能拡張（予定）
- 📝 メモ・コメント機能
- 📊 学習進捗管理（読んだ/理解した/実践した）
- 🔄 自動収集（RSS登録による半自動収集）

### Phase 3: チーム対応（予定）
- 👥 マルチユーザー対応（10人以下想定）
- 🔗 記事共有機能

## 🛠 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **React Hook Form** + **Zod**（フォーム管理・バリデーション）
- **Tailwind CSS** + **shadcn/ui**
- **Zustand + TanStack Query**（状態管理）
- **Day.js**（日付フォーマット）
- **sonner**（トースト通知）
- **clsx + tailwind-merge**（className管理）

### バックエンド
- **Next.js API Routes**
- **Supabase** (PostgreSQL + Auth + Storage)

### インフラ
- **Vercel**（ホスティング）
- **Supabase**（データベース・認証）

### 開発環境
- **npm**（パッケージマネージャー）
- **Vitest**（ユニットテスト）
- **Playwright**（E2Eテスト）
- **ESLint + Prettier**

## 💰 コスト

- **Phase 1**: $0/月（Vercel + Supabase 無料枠）
- **スケーリング時**（チーム利用、10人）: $0-25/月

## 📂 プロジェクト構造

```
LinkLoom/
├── .kiro/              # 仕様駆動開発（Kiro）
│   ├── specs/         # 機能仕様
│   └── steering/      # プロジェクト全体コンテキスト
├── .claude/           # Claude Code設定
├── app/               # Next.js App Router
│   ├── (auth)/       # 認証関連ルート
│   ├── (dashboard)/  # メインアプリケーション
│   └── api/          # API Routes
├── components/        # Reactコンポーネント
│   ├── ui/           # shadcn/ui コンポーネント
│   └── features/     # 機能別コンポーネント
├── lib/               # ユーティリティとヘルパー
├── types/             # TypeScript型定義
├── tests/             # テストファイル
└── supabase/          # Supabaseローカル開発
```

## 🚀 セットアップ

### 必要環境
- Node.js 18+
- npm

### 環境変数

`.env.local` ファイルを作成：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/LinkLoom.git
cd LinkLoom

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📝 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Lint
npm run lint

# テスト（Vitest）
npm run test

# E2Eテスト（Playwright）
npm run test:e2e

# 型チェック
npm run type-check
```

## 🧪 テスト

- **Vitest**: ユーティリティ関数、カスタムフック、コンポーネントのユニットテスト
- **Playwright**: ユーザーフロー（ログイン、記事登録、検索等）のE2Eテスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# E2Eテスト（UI mode）
npm run test:e2e:ui
```

## 📚 開発ガイド

### 仕様駆動開発（Kiro + SuperClaude）

このプロジェクトは **cc-sdd（Kiro）** と **SuperClaude** を使用した仕様駆動開発を採用しています。

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

### Steeringドキュメント

プロジェクト全体のコンテキストは `.kiro/steering/` に記載されています：

- **product.md**: プロダクトビジョンと要件
- **tech.md**: 技術スタック詳細
- **structure.md**: プロジェクト構造とコード規約

## 🎯 今後の展望

- チーム機能（共有、コメント、レビュー）
- ブラウザ拡張機能（ワンクリック保存）
- モバイルアプリ（PWA or React Native）

---

**現在フェーズ**: Phase 1（MVP開発中）
**最終更新**: 2025-10-05
