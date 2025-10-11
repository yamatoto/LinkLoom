# LinkLoom - Technology Stack

## アーキテクチャ概要

### シンプルな単一プロジェクト構成

```
Next.js App (Vercel)
    ↓
Supabase (PostgreSQL + Auth + Storage)
```

---

## フロントエンド

### コアフレームワーク

- **Next.js 15** (App Router)
  - **選定理由**:
    - React 19対応
    - Turbopackの安定化による高速な開発体験
    - API Routesでバックエンドロジック実装可能
    - Vercelでの最適化されたデプロイ
    - Vitestとの相性◎
  - **使用機能**:
    - App Router（ファイルベースルーティング）
    - Server Components
    - API Routes（URLメタデータ取得、RSS収集等）
    - Middleware（認証チェック）

### 言語・型安全性

- **TypeScript**
  - 型安全性の確保
  - 開発体験の向上
  - エディタ補完の強化

- **Zod**
  - **用途**: フォームバリデーション、APIレスポンス検証
  - **選定理由**:
    - TypeScript完全統合（型推論）
    - Supabase型定義との連携
    - React Hook Formとの相性◎
    - ランタイム型チェック
  - **使用例**:
    - 記事登録フォームバリデーション
    - API Routeのリクエスト/レスポンス検証
    - 環境変数の型安全な読み込み

### スタイリング

- **Tailwind CSS**
  - ユーティリティファーストCSS
  - 高速な開発速度
  - カスタマイズ性◎
  - **設定**: `tailwind.config.ts`

### UIコンポーネントライブラリ

- **shadcn/ui**
  - **選定理由**:
    - Tailwind CSS + Radix UIベース
    - コピペで使える（依存関係が少ない）
    - カスタマイズ性が高い
    - TypeScript完全対応
    - アクセシビリティ◎
  - **使用コンポーネント**:
    - Button, Card, Input, Select
    - Dialog, DropdownMenu
    - Badge, Separator
    - Command (検索UI)

### フォーム管理

- **React Hook Form**
  - **用途**: フォーム状態管理、バリデーション
  - **選定理由**:
    - Zodとの完璧な統合（`@hookform/resolvers`）
    - 非制御コンポーネントで高パフォーマンス
    - TypeScript完全対応
    - エラーハンドリングが簡単
  - **使用箇所**:
    - 記事登録フォーム
    - 記事編集フォーム
    - タグ入力フォーム

### 状態管理

- **Zustand**
  - **用途**: クライアントサイド状態（フィルタ、UI状態）
  - **選定理由**: 軽量でシンプル、Redux不要の小規模アプリ向け

- **TanStack Query (React Query)**
  - **用途**: サーバー状態管理（Supabaseデータフェッチ）
  - **選定理由**:
    - キャッシュ管理自動化
    - 楽観的更新
    - エラーハンドリング
    - Supabaseとの相性◎

### ユーティリティライブラリ

- **Day.js**
  - **用途**: 日付フォーマット
  - **選定理由**:
    - 軽量（2KB）
    - 日本語ロケール対応
    - シンプルなAPI
  - **使用例**:
    - 記事投稿日表示（"2025年10月5日"）
    - 相対時間表示（"3日前"）

- **clsx + tailwind-merge**
  - **用途**: className管理
  - **選定理由**:
    - 条件付きclassNameの結合
    - Tailwindクラスの重複解決
    - shadcn/ui標準ユーティリティ
  - **使用**: `lib/utils/cn.ts`

- **sonner**
  - **用途**: トースト通知
  - **選定理由**:
    - モダンなUI
    - shadcn/ui推奨
    - TypeScript対応
    - カスタマイズ性◎
  - **使用例**:
    - 記事保存成功/失敗通知
    - 削除確認フィードバック

---

## バックエンド

### BaaS (Backend as a Service)

- **Supabase**
  - **選定理由**:
    - PostgreSQL（SQL知識が活かせる）
    - 無料枠が大きい（500MB DB, 1GB Storage）
    - 認証・ストレージ・リアルタイム同期が統合
    - 学習機会（新技術習得）
    - APIが使いやすい

### データベース

- **PostgreSQL** (Supabase管理)
  - **Schema設計**:
    - `articles`: 記事情報
    - `auth.users`: ユーザー情報（Supabase管理）
    - Phase 2: `notes`, `progress`, `rss_feeds`
  - **インデックス最適化**:
    - title, tags, difficulty でのインデックス
    - フルテキスト検索用インデックス

### 認証

- **Supabase Auth**
  - **方式**: Googleログイン（OAuth 2.0）
  - **選定理由**:
    - 実装が簡単
    - UX良い（パスワード不要）
    - セキュアな認証フロー

### ストレージ

- **Supabase Storage**
  - **用途**: 記事サムネイル、ユーザーアバター（将来）
  - **無料枠**: 1GB

### API実装

- **Next.js API Routes**
  - **用途**:
    - URLメタデータ取得 (`/api/fetch-metadata`)
    - RSS収集 (`/api/collect-rss`) - Phase 2
  - **選定理由**:
    - APIキーをサーバー側で安全管理
    - Node.js環境でデバッグしやすい
    - Vercelで自動デプロイ

---

## インフラストラクチャ

### ホスティング

- **Vercel** (フロントエンド + API Routes)
  - **プラン**: Hobby（無料）
  - **機能**:
    - 自動デプロイ（GitHub連携）
    - プレビューデプロイ
    - Edge Functions
    - 環境変数管理

### データベースホスティング

- **Supabase** (マネージドPostgreSQL)
  - **プラン**: Free
  - **制限**:
    - 500MB データベース
    - 1GB ストレージ
    - 50K 月間アクティブユーザー
    - 2GB 帯域幅

### ドメイン・DNS

- Phase 1: Vercelデフォルトドメイン (`*.vercel.app`)
- Phase 2+: カスタムドメイン検討

---

## 開発環境

### パッケージマネージャー

- **npm**
  - Node.js標準、追加インストール不要
  - シンプルな単一プロジェクト構成

### 依存関係バージョン管理

#### ✅ 推奨されるバージョン指定方法

```json
{
  "dependencies": {
    "next": "^15.0.0", // ✅ 正しい: major.minor.patch すべて指定
    "react": "^19.0.0" // ✅ パッチ・マイナーアップデート許容
  },
  "devDependencies": {
    "@types/node": "^20.16.0", // ✅ 明確なベースライン
    "typescript": "^5.6.0" // ✅ 現在の安定版
  }
}
```

#### ❌ 避けるべきバージョン指定

```json
{
  "dependencies": {
    "react": "^19" // ❌ メジャーバージョンのみ（19.0〜19.999まで許容）
  },
  "devDependencies": {
    "@types/node": "^20", // ❌ 予期しないマイナーバージョンの破壊的変更リスク
    "eslint": "^8", // ❌ チーム間・CI/CD環境で異なるバージョン
    "typescript": "^5" // ❌ 再現性が低い（いつインストールするかで動作変わる）
  }
}
```

#### バージョン指定ルール

1. **major.minor.patch形式を必須とする**: `^X.Y.Z`（`^X`や`^X.Y`は禁止）
2. **キャレット(`^`)推奨**: マイナー・パッチアップデートを許容、メジャーは固定
3. **チルダ(`~`)は限定的**: パッチアップデートのみ許容が必要な場合
4. **固定バージョンは避ける**: セキュリティパッチが適用されない

#### 理由

- **再現性**: チーム全員が同じベースラインからスタート
- **安全性**: 予期しない破壊的変更を防ぐ
- **デバッグ性**: どのバージョンで問題が起きたか明確
- **セキュリティ**: パッチアップデートを受け取れる

#### Node.jsバージョン戦略

- **開発環境**: Node.js 20.16.0（LTS - Hydrogen）
- **推奨**: LTS版を使用（偶数バージョン: 20, 22）
- **避ける**: Current版（奇数バージョン: 21, 23, 25）
- **アップグレード**: LTS移行後、十分なテスト期間を経て

### テスティング

- **Vitest**
  - **用途**: ユニットテスト、コンポーネントテスト
  - **対象**: ユーティリティ関数、カスタムフック、ロジック
  - **選定理由**:
    - Viteベースで高速
    - Next.jsと相性◎
    - TypeScript完全対応

- **Playwright**
  - **用途**: E2Eテスト
  - **対象**: ユーザーフロー（ログイン、記事登録、検索等）
  - **ブラウザ対応**: **Chromiumのみ**
    - **方針**: このプロジェクトではChrome/Edge（Chromiumベース）のみをサポート
    - **理由**: 個人・小規模チーム向けプロジェクトのため、クロスブラウザテストは不要
    - **注意**: Firefox、Safari、モバイルブラウザのテストは実施しない
  - **選定理由**:
    - 信頼性の高いE2Eテスト
    - SuperClaude統合（`/sc:test`）
    - CI/CDでの安定した実行

### Linter & Formatter

- **ESLint**
  - Next.js推奨設定
  - TypeScript対応
  - React Hooks ルール

- **Prettier**
  - コードフォーマット統一
  - 保存時自動フォーマット

### バージョン管理

- **Git + GitHub**
  - ソースコード管理
  - Issue管理
  - CI/CD（GitHub Actions）

---

## 共通コマンド

### Phase 1 開発コマンド

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

### Supabaseコマンド

```bash
# Supabase CLIインストール
npm install -g supabase

# ローカルSupabase起動
supabase start

# マイグレーション作成
supabase migration new <migration_name>

# マイグレーション適用
supabase db push

# 型定義生成
supabase gen types typescript --local > types/supabase.ts
```

---

## 環境変数

### 必須環境変数

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 環境変数管理

- **.env.local**: ローカル開発用
- **Vercel環境変数**: 本番・プレビュー環境用
- `.env.example`: テンプレート（Gitにコミット）

---

## ポート設定

### 開発環境ポート

- **Next.js**: `http://localhost:3000`
- **Supabase Studio**: `http://localhost:54323`
- **PostgreSQL**: `localhost:54322`

---

## 外部API・サービス

### Phase 1

- **Supabase**: データベース、認証、ストレージ

### Phase 2以降

- **RSS Parser**
  - ライブラリ: `rss-parser` (npm)
  - 用途: 自動記事収集

---

## セキュリティ

### 認証・認可

- Supabase Auth（JWT Token）
- Row Level Security (RLS)ポリシー設定
- HTTPS通信（Vercel自動対応）

### APIキー管理

- 環境変数で管理
- クライアントには露出させない（API Routesで処理）
- GitHub Secretsで本番環境管理

### データ保護

- Supabaseバックアップ（自動）
- ユーザーデータの暗号化（Supabase標準）

---

## パフォーマンス最適化

### フロントエンド

- Next.js App Router（Server Components）
- TanStack Queryによるキャッシュ管理
- 画像最適化（Next.js Image）
- Code Splitting（動的インポート）

### バックエンド

- PostgreSQLインデックス最適化
- Supabaseクエリ最適化
- API Routeキャッシュ戦略

---

## コスト見積もり

### Phase 1（MVP）

- **Vercel**: $0/月（Hobbyプラン）
- **Supabase**: $0/月（Freeプラン）
- **合計**: **$0/月**

### Phase 2（機能追加）

- **Vercel**: $0/月
- **Supabase**: $0/月
- **合計**: **$0/月**

### スケーリング時（チーム利用、10人）

- **Vercel**: $0/月（Hobbyで継続可能）
- **Supabase**: $0/月 or $25/月（Proプラン検討）
- **合計**: **$0-25/月**

---

## CI/CD

### GitHub Actions

- **Lint & Type Check**: PRごとに実行
- **Test**: Vitest + Playwright（PRごと）
- **デプロイ**: Vercel自動デプロイ（mainブランチマージ時）

### デプロイフロー

```
開発ブランチ → PR作成 → テスト実行 → レビュー → マージ → 自動デプロイ
```

---

## 将来の技術的拡張（Phase 2+）

### モバイル対応

- **PWA** or **React Native**

### 高度な機能

- **全文検索**: PostgreSQL Full-Text Search
- **関連記事推薦**: ベクトル検索（pgvector）（検討）

---

**最終更新**: 2025-10-05
**技術選定完了**: Phase 1仕様確定
