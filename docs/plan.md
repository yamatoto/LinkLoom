# LinkLoom 開発計画

**最終更新**: 2025-11-03（タスク3・4・5完了）

---

## 📖 プロジェクト概要

技術記事を効率的に保存・検索・管理するパーソナル知識管理システム。note、Qiita、Zennなど複数のプラットフォームの記事を一元管理し、タグで分類、キーワード検索で素早くアクセスできる。

---

## 📊 現在の状態

- **Phase 1 MVP**: 100%完了 ✅
- **総テスト数**: 184テスト（すべて合格）
- **静的解析**: Lint/TypeScript エラー0件

### 実装済み機能

- ✅ 認証・同期（Google OAuth）
- ✅ 記事登録（7プラットフォーム対応、自動判定）
- ✅ 記事一覧表示（カード形式）
- ✅ 検索・フィルタリング（キーワード、タグ、並び替え）
- ✅ 記事編集・削除

---

## 🎯 次にやるべきこと（Phase 2: UX改善）

以下のタスクを優先順位順に、一つずつPRにして実装する。

### ✅ タスク1: トップ画面の記事検索リンクを削除（完了）

**目的**: 記事一覧に検索機能が実装済みのため、冗長な「Coming soon...」リンクを削除

**実装内容**:

- 記事検索カードを削除（ログイン時・未ログイン時ともに）
- グリッドレイアウトを2カラムに変更（`sm:grid-cols-2 lg:grid-cols-2`）

**テスト結果**: E2Eテスト29件すべて合格 ✅

---

### ✅ タスク2: 一覧画面にヘッダーコンポーネントを追加（完了）

**目的**: ナビゲーションの統一（トップ画面と同じHeader表示）

**対象ファイル**:

- `src/app/articles/page.tsx`

**実装内容**:

- Headerコンポーネントをインポート・追加
- レイアウトを全画面構造に調整（`min-h-screen`, `bg-gray-50`）

**テスト結果**: E2Eテスト18件すべて合格 ✅

---

### ✅ タスク3: ボタンデザインの統一（完了）

**目的**: UI一貫性の向上（すべてのボタン・カード・フィルターのスタイル統一）

**問題**: `globals.css` に shadcn/ui の CSS 変数が未定義で、すべてのボタンとカードコンポーネントでスタイルが適用されていなかった

**対象ファイル**:

- `src/app/globals.css`

**実装内容**:

- shadcn/ui の CSS 変数（`--primary`, `--destructive`, `--border` など）を追加
- Chrome DevTools MCP でスタイル確認（記事一覧、編集、登録画面）

**テスト結果**:

- ユニット/統合テスト: 184件すべて合格 ✅
- E2Eテスト: 29件すべて合格 ✅

---

### ✅ タスク4: 削除ボタンの配置・デザイン改善（完了）

**目的**: 更新ボタンとの視覚的統一と配置調整、冗長な「記事を開く」ボタンの削除

**対象ファイル**:

- `src/app/articles/[id]/_components/EditArticleForm.tsx`
- `src/components/articles/ArticleForm.tsx`
- `src/components/articles/ArticleCard.tsx`
- `tests/unit/components/ArticleCard.test.tsx`

**実装内容**:

- `ArticleForm`に`additionalActions`プロップを追加し、削除ボタンを更新ボタンと同じ行に配置
- ボタン間のスペーシング調整（`gap-3`で統一）
- `ArticleCard`から冗長な「記事を開く」ボタンを削除し、タイトルに`ExternalLink`アイコンを追加
- UI/UXベストプラクティスに基づき、リンクの重複を排除

**テスト結果**:

- ユニット/統合テスト: 184件すべて合格 ✅
- E2Eテスト: スキップ（UI変更のみのため）

---

### ✅ タスク5: 更新成功時のユーザーフィードバック改善（完了）

**目的**: 更新後の自動遷移で使いやすさ向上

**対象ファイル**:

- `src/app/layout.tsx`
- `src/app/articles/[id]/_components/EditArticleForm.tsx`
- `tests/unit/components/EditArticleForm.test.tsx`
- `tests/e2e/article-edit.spec.ts`
- `tests/e2e/global-setup.ts`

**実装内容**:

- 更新成功時に`router.push('/articles')`で一覧画面へ自動遷移（`router.refresh()`から変更）
- **トースト表示の根本修正**: `layout.tsx`に`<Toaster />`コンポーネントを追加し、ページ遷移してもトーストが表示され続けるように修正
- ユニットテスト・E2Eテストを更新して一覧画面への遷移を検証
- E2E認証セッションの再利用を改善（Cookieベースで2回目以降の認証をスキップ）

**テスト結果**:

- ユニット/統合テスト: 184件すべて合格 ✅
- E2Eテスト: 2件すべて合格 ✅

---

### タスク6: 編集画面への遷移を高速化

**目的**: ローディング表示でUX向上

**対象ファイル**:

- `src/app/articles/[id]/loading.tsx`（新規作成）

**実装内容**:

- Next.jsの`loading.tsx`を作成
- スケルトンローディングまたはスピナー表示

**テスト**: 手動確認（ローディング表示の視覚確認）

---

### メモ: 遷移が遅い件（継続対応用）

**現状**

- 「データ取得が終わっていなくても画面構造は即表示」したい
- 初回遷移で `articles?_rsc=...` のネットワークリクエストが遅い。
  - 計測（Chrome DevTools / Network）
    - 変更前: 約 1.66s（データ1件でも遅い）
    - DBインデックス追加後: 約 1.02s に改善（まだ体感的に遅い）

**これまでに実施したこと**

- ローディングUI/ストリーミング
  - `src/app/articles/[id]/loading.tsx` を作成し、静的文言は即表示・データ箇所のみスケルトンに修正。
  - `src/app/articles/new/loading.tsx` を追加（入力欄のみスケルトン）。
  - 記事一覧: `Suspense` を導入しフォールバック表示。
    - `src/app/articles/page.tsx` をレイアウト見直し。
      - 見出し/グリッドのフレームを常に即表示。
      - サイドバーと記事一覧を別 `Suspense` 境界に分割。
      - フォールバック: `SidebarLoadingFallback` / `ArticlesLoadingFallback`。
    - データ取得の分離。
      - `src/app/articles/_components/ArticlesContent.tsx`: 記事のみ取得・表示。
      - `src/app/articles/_components/ArticlesSidebar.tsx`: タグ一覧を取得して `SearchFilters` を表示（`react` の `cache` でメモ化）。

- 事前取得/プリフェッチ
  - トップページを Server Component 化（`src/app/page.tsx`）。
  - ログイン済み時に `searchArticles` / `getAllTags` を事前起動（失敗は握りつぶし）。
  - 各種 `Link` に `prefetch={true}` を付与（トップ→新規/一覧、一覧カードの編集リンク）。

- DB/クエリ最適化
  - インデックス（Supabaseダッシュボードで実行）
    - `articles(user_id, created_at DESC)`
    - `articles(user_id, updated_at DESC)`
  - `searchArticles` を `user_id` 明示フィルタに変更。
    - テストモック環境で `.eq` が無い場合に備えたガードを追加。
  - `tags` は共有マスターのため `user_id` フィルタを削除。

**効果/現状の課題**

- 体感: ページのフレーム（見出し/レイアウト/サイドバーのスケルトン）は即表示されるようになった。
- 依然として RSC リクエスト完了まで ~1.0s。記事1件でも発生。クエリ往復/結合、RSC生成待ちが要因の可能性。
- 現在、記事取得後にタグ情報をまとめて取得する2本目のクエリがある（少数件でも往復は発生）。

**次にやるべきこと（候補）**

1. 記事タグの取得をさらに分離し、タグ部分を別 `Suspense` 境界に（タイトル/日付は先に確定、タグは後追い）。
2. 記事クエリの列を最小化（`*` をやめ、必要カラム + 最小限の `platform` 情報に絞る）。
3. 上限/ページング導入（初回は `limit 20`、スクロール/ページ切替で追加）。
4. `unstable_cache`（Next.js）でユーザーID+検索条件キーの短期キャッシュ（例: 10〜30秒）。
5. 計測の自動化（Performance タブのトレース保存・比較、Network 条件の統一）。

（補足）ローカル開発では開発サーバー起因の遅延も混ざるため、同一条件で計測しつつ、まずはクエリ本数削減と RSC ペイロード縮小を優先する。

---

### タスク7: 記事一覧・記事登録画面への遷移を高速化

**目的**: トップページから記事一覧・記事登録画面への遷移時のローディング表示でUX向上

**対象ファイル**:

- `src/app/articles/loading.tsx`（新規作成）
- `src/app/articles/new/loading.tsx`（新規作成）

**実装内容**:

- Next.jsの`loading.tsx`を各ページに作成
- タスク6と同様、スケルトンローディングまたはスピナー表示
- トップページからの遷移時に約1秒かかっている待機時間を改善

**テスト**: 手動確認（ローディング表示の視覚確認）

---

## 🛠 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **認証**: Supabase Auth (Google OAuth)
- **データベース**: Supabase PostgreSQL + RLS
- **UI**: React 19, TailwindCSS, shadcn/ui
- **フォーム**: React Hook Form + Zod
- **テスト**: Vitest (UT/統合), Playwright (E2E)

---

## 💡 重要なドキュメント

- [CLAUDE.md](../CLAUDE.md) - 開発ガイドライン（ワークフロー、コマンド、品質原則）
- [tests/README.md](../tests/README.md) - テストガイドライン
- [docs/database-schema-implementation.md](./database-schema-implementation.md) - データベース設計
- [specs/README.md](../specs/README.md) - 仕様駆動開発ガイド

---

## 🔄 セッション開始時のチェックリスト

1. **環境確認**
   - [ ] `npm run dev` でローカル開発サーバーを起動
   - [ ] `npm run lint && npm run tsc` でエラーがないか確認

2. **作業確認**
   - [ ] このplan.mdの「次にやるべきこと」を読む
   - [ ] 最初の未完了タスクから着手

3. **実装完了時**
   - [ ] テストを実行
     - ユニット/統合テスト: `npm run test`
     - E2Eテスト: `npm run e2e:ci`（注: サンドボックス環境ではなく`all`権限で実行すること）
   - [ ] コミット作成
   - [ ] このplan.mdのタスクを完了にマーク

---

## 🎨 デザインタスク実施ガイドライン

UIデザインに関するタスク（ボタン、レイアウト、色、スタイリングなど）を実施する際の注意事項：

### Chrome DevTools MCP の使用

- **必須**: デザインタスクでは必ず Chrome DevTools MCP を使用して、画面デザインが正しく適用されているか確認すること
- **視覚確認**: 実際のブラウザでスタイルを確認しながら作業を進めること

### トラブルシューティング

- **接続エラー時の対応**: Chrome DevTools MCP が接続できない場合は、Playwright MCP への切り替えは行わず、原因を調査して解決すること
  - 開発サーバーが起動しているか確認（`lsof -i :3000`）
  - `all` 権限でサーバーを起動しているか確認
  - ポートが他のプロセスに使用されていないか確認

### 環境制約

- **サンドボックス制約**: Chrome DevTools MCP と開発サーバーの起動は、サンドボックス環境では動作しない
  - 開発サーバー起動: `required_permissions: ["all"]` を指定すること
  - プロセス確認コマンド: `required_permissions: ["all"]` を指定すること

---

## 🎯 将来的な検討事項（Phase 3以降）

- メモ・コメント機能
- 学習進捗管理（読んだ/理解した/実践した）
- 自動収集（RSS登録による半自動収集）
- アーカイブ機能
- マルチユーザー対応（チーム対応）
- 記事共有機能

---

**現在フェーズ**: Phase 2（UX改善）
**次のタスク**: タスク6（編集画面への遷移を高速化）
