# LinkLoom

技術記事を効率的に保存・検索・管理するパーソナル知識管理システム

## 📖 概要

note、Qiita、Zennなど複数のプラットフォームの記事を一元管理。タグで分類し、キーワード検索で目的の記事を即座に見つけられます。

**現在の状態**: Phase 1 MVP開発中（認証機能完了、記事管理機能は未実装）

**詳細**: [docs/plan.md](./docs/plan.md) で全体計画と進捗を確認できます。

## 🛠 技術スタック

- **Frontend**: Next.js 15 (App Router), TypeScript, React Hook Form + Zod, Tailwind CSS + shadcn/ui
- **State**: Zustand + TanStack Query
- **Backend**: Supabase (PostgreSQL + Auth)
- **Test**: Vitest, Playwright, React Testing Library
- **Infra**: Vercel + Supabase（無料枠で$0/月）

## 📂 プロジェクト構造

```
LinkLoom/
├── src/               # ソースコード（app/, components/, hooks/, lib/）
├── tests/             # テスト（unit/, e2e/, mocks/）
├── specs/             # 機能仕様（軽量仕様駆動開発）
├── docs/              # ドキュメント
│   └── plan.md       # 全体計画と進捗
├── .claude/           # Claude Code設定（commands/, skills/）
└── supabase/          # Supabaseマイグレーション
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
npm run tsc
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

## 📚 ドキュメント

- **[docs/plan.md](./docs/plan.md)** - 全体計画と進捗（次にやるべきことを確認）
- **[CLAUDE.md](./CLAUDE.md)** - 開発ガイドライン（カスタムコマンド、Agent Skills、品質原則）
- **[tests/README.md](./tests/README.md)** - テストガイドライン

## 🎯 開発参加

1. このリポジトリをクローン
2. `npm install` で依存関係をインストール
3. `.env.local` を作成（Supabase設定）
4. [docs/plan.md](./docs/plan.md) で全体像と次のタスクを確認
5. [CLAUDE.md](./CLAUDE.md) で開発フローを確認
