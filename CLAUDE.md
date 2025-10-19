# LinkLoom 開発ガイドライン

このドキュメントはClaude Codeによる開発時のガイドラインです。

**プロジェクト概要・進捗**: [docs/plan.md](./docs/plan.md) を参照してください。

## 🛠 開発アプローチ

### 軽量仕様駆動開発

過剰なドキュメントを避け、必要最小限の仕様をメモ程度に整理する実践的なアプローチです。

**基本構成:**

```
specs/
└── [feature-name]/
    ├── brief.md      # 概要（5-10行）
    ├── design.md     # 設計メモ（10-20行）
    └── tasks.md      # タスク一覧（TodoWrite形式）
```

**メリット:**

- 📝 簡潔: 人間が素早く読める（5分以内）
- 🤖 AI理解: AIが全体像を把握しやすい
- 🔄 柔軟: 実装しながら更新可能
- ⚡ 高速: ドキュメント作成に時間をかけすぎない

### カスタムコマンドとペルソナ

**カスタムコマンド**（`/my:` プレフィックス）：

- **analyze** - コード品質分析
- **brainstorm** - 要件の深掘り
- **design** - 設計支援
- **git** - Gitコミット支援
- **implement** - 実装支援
- **improve** - コード改善
- **load** / **save** - セッション管理
- **research** - 調査支援
- **spec-panel** - 仕様レビュー
- **test** - テスト支援
- **troubleshoot** - 問題診断

**ペルソナ設定**: タスク内容に応じて、適切な専門家ペルソナ（TypeScript Expert、Frontend Architect、Security Engineerなど）が自動的に適用されます。

**Agent Skills**: 複雑なタスクを自動化する専門スキル：

- **git-auto-commit**: Conventional Commits形式でのコミット・プッシュ
- **multi-expert-code-review**: 5人の専門家による並列コードレビュー
- **spec-brainstorm-doc**: Socratic対話による仕様ブレインストーミングと自動ドキュメント化

## 開発ガイドライン

### 基本原則

- 思考は英語、回答の生成は日本語で行うように
- 必要に応じてカスタムコマンド（`/my:` プレフィックス）を活用する
- **簡潔さを優先**: 形式や記法に固執せず、読みやすさと実用性を重視する

### 品質原則：専門家基準の徹底

**コア原則:**
CLAUDE.mdに具体例が書かれていなくても、**常に専門家レベルの品質**を提供すること。

#### プロアクティブな品質管理

1. **すべての設定ファイルは、作成時点で最適化されている**
   - tsconfig.json → 厳格な型チェック、モダンなtarget設定
   - .eslintrc.json → TypeScript専用ルール、ベストプラクティス適用
   - package.json → `major.minor.patch`形式のバージョン指定
   - その他設定ファイル → 業界標準のベストプラクティス適用

2. **「動けばいい」ではなく「プロダクション品質」を目指す**
   - 最小限の設定は避ける
   - セキュリティ、保守性、パフォーマンスを考慮
   - デッドコード、未使用変数、潜在的バグを防ぐ設定

3. **ユーザーが指摘する前に問題を発見・修正**
   - ファイル作成後、自発的に品質チェック
   - 低品質な設定を発見したら即座に改善提案または自動修正
   - 「なぜこの設定が重要か」を簡潔に説明

4. **静的解析エラーゼロで作業完了**
   - 作業完了前に必ず `npm run lint` と `npm run tsc` を実行
   - すべてのlintエラー・TypeScriptエラーを修正してから完了報告
   - 「エラーは後で修正してください」という対応は厳禁
   - プロダクション品質を維持するための絶対的な品質ゲート

#### 自動化の原則

- CLAUDE.mdに具体例を書く必要はない（Claude Codeが既に知識を持っている）
- 設定ファイル作成 → 自動的にベストプラクティス適用
- 既存ファイルの問題発見 → 即座に改善提案
- スケールする品質管理（個別ルールの羅列ではなく、原則で動く）

#### ドキュメント作成の原則

- **簡潔さ最優先**: 読みやすさと実用性を重視し、形式的な記法に固執しない
- **テーブル定義**: Markdown表形式またはDDL例で記述（EARS形式不要）
- **動的な振る舞い**: 必要に応じてWHEN/IF/THEN形式で記述
- **AIの理解**: 構造化データ（表、DDL）の方がAIは正確に理解する
- **ユーザビリティ**: 開発者が読んですぐ理解できる形式を選択

## 🔄 開発ワークフロー

### 実践的ワークフロー（軽量仕様駆動開発）

#### Phase 0: プロジェクト準備

1. **セッションロード**（必要時）: `/my:load` - 前回のセッションコンテキストを復元
2. **要件ブレインストーミング**（必要時）: `/my:brainstorm` - 要件を深掘り

#### Phase 1: 簡易仕様作成

1. **仕様ディレクトリ作成**

   ```bash
   mkdir -p specs/[feature-name]
   ```

2. **brief.md 作成** (5-10行)
   - 何を作るか
   - なぜ必要か
   - どこに実装するか

3. **design.md 作成** (10-20行)
   - 主要コンポーネント
   - データフロー
   - 技術選択

4. **tasks.md 作成** (TodoWrite形式)
   - 実装タスクのリスト
   - 優先順位付き

**活用**:

- `/my:brainstorm` で要件を深掘り
- `/my:design` で設計支援

#### Phase 2: 実装

1. **実装開始**
   - **活用**: `/my:implement` で実装支援

2. **継続的品質管理**:
   - `/my:analyze` - コード品質・セキュリティ分析
   - `/my:test` - テスト実行
   - `/my:improve` - リファクタリングと最適化

3. **実装完了前の必須チェック**（この順序を厳守）:

   a. **静的解析チェック**
      - `npm run lint` を実行してESLintエラーをゼロに
      - `npm run tsc` を実行してTypeScriptエラーをゼロに

   b. **Chrome DevTools MCPで動作確認**
      - `npm run dev` で開発サーバー起動
      - Chrome DevTools MCPでブラウザ操作
      - 実装した機能が正常に動作することを確認
      - エラーがあれば修正してから次へ

   c. **multi-expert-code-reviewでレビュー**
      - Agent Skillの`multi-expert-code-review`を実行
      - 5人の専門家による並列レビューを実施
      - レビュー結果を分析

   d. **レビュー指摘への対応判断**
      - **小規模な修正**: その場で即座に対応
      - **大規模な修正**:
        1. `docs/review-feedback/[date]_[feature-name].md` にドキュメント化
        2. 対応内容を整理してユーザーに確認
        3. ユーザーの判断を待つ
      - 対応後、再度Chrome DevTools MCPで動作確認

   e. **ユーザーへ完了確認**
      - 実装内容の簡潔なサマリーを提示
      - 「このタスクを完了として良いですか？」と明示的に確認

**重要**: この手順を飛ばして完了確認を求めることは厳禁

#### Phase 3: デプロイと保守

1. **ビルド**: `npm run build`
2. **Git操作**（必要時）: `/my:git` でコミット支援
3. **セッション保存**（必要時）: `/my:save`

#### Phase 4: トラブルシューティング

- `/my:troubleshoot` - 問題の診断と解決

### タスク完了時のワークフロー

**重要**: タスクを完了したと判断したら、必ず以下の手順を実行してください。

1. **完了確認をユーザーに求める**
   - 実装内容の簡潔なサマリーを提示
   - 「このタスクを完了として良いですか？」と明示的に確認

2. **ユーザーの許可が得られたら**
   - `docs/plan.md` の該当セクションを更新
   - 完了した機能の ✅ マークを追加
   - 進捗バーを更新（該当する場合）
   - **最終更新日**を更新

3. **コミット**
   - `/my:git` でコミット・プッシュ
   - コミットメッセージに完了したタスクを明記

**例**:

```
✅ タスク完了しました：記事登録フォームの実装

実装内容:
- React Hook Form + Zod によるバリデーション
- プラットフォーム自動判定機能
- エラーハンドリング

このタスクを完了として良いですか？
許可いただければ、docs/plan.md の進捗を更新します。
```

## 📋 開発ルール

### MCP（Model Context Protocol）ツール利用の原則

**重要**: MCPツールが動作しない場合、**必ず根本原因を調査してから対処する**こと。

#### 動作しないMCPツールへの対応手順

1. **エラーメッセージを正確に読む**
   - パラメータの型エラー、必須フィールドの不足、APIの変更などを確認
   - エラーの根本原因を特定する

2. **ツール定義を確認する**
   - ツールのスキーマ定義を読み、正しいパラメータ名・型を使用しているか確認
   - 例: Chrome DevTools MCPの`click`ツールは`uid`パラメータを要求（`ref`ではない）

3. **問題を修正する**
   - 正しいパラメータ名・型で再試行
   - 必要に応じてツール定義を参照し、正しい使い方を理解する

4. **回避策は最終手段**
   - **禁止**: エラーを無視して別の方法を試す（JavaScriptでの手動操作など）
   - **許可**: 根本原因を調査し、MCPツール自体のバグや制約が確認された場合のみ回避策を使用

**例（Chrome DevTools MCP）**:

```typescript
// ❌ 誤り: refパラメータを使用
<invoke name="mcp__chrome-devtools__click">
<parameter name="element">ボタン</parameter>
<parameter name="ref">4_23</parameter>  // 間違い！
</invoke>

// ✅ 正しい: uidパラメータを使用
<invoke name="mcp__chrome-devtools__click">
<parameter name="element">ボタン</parameter>
<parameter name="uid">4_23</parameter>  // 正しい
</invoke>
```

**理由**: この原則により、Claude Codeは継続的にMCPツールの正しい使い方を学習し、将来のセッションで同じエラーを繰り返さなくなる。回避策に逃げると、根本問題が放置され、品質が低下する。

---

### テストガイドライン

**包括的なテストガイドラインは @tests/README.md を参照してください。**

**最重要原則**:

- 作業完了前に必ず `npm run lint` と `npm run tsc` を実行
- すべてのlintエラー・TypeScriptエラーを修正してから完了報告
- テストをスキップ・無効化しない（失敗原因を調査して修正）

---

## 💡 クイックスタートガイド

### 新機能を開発する場合

1. **仕様作成**: `specs/[feature-name]/` ディレクトリに `brief.md`、`design.md`、`tasks.md` を作成
2. **実装**: Claude Codeと対話しながら実装
3. **品質チェック**: `npm run lint` と `npm run tsc` を実行
4. **テスト**: `npm run test` でユニットテスト、`npm run test:e2e` でE2Eテスト

### 既存コードを改善する場合

1. **分析**: `/my:analyze` で問題を特定
2. **問題診断**: `/my:troubleshoot` でエラーを診断
3. **改善実行**: `/my:improve` で改善
4. **テスト**: `npm run test` で検証

### 開発サーバーの起動

```bash
npm run dev
```

Chrome DevTools MCPを使った動作確認を行う際は、このコマンドで開発サーバーを起動してください。

### Chrome DevTools MCP の認証設定

**公式の自動User Data Directory を使用**

Chrome DevTools MCP は **自動的にUser Data Directoryを管理** し、ログイン状態を永続化します：

```json
// Claude Desktop MCP設定例
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest", "--headless=false"]
    }
  }
}
```

**セッション永続化の仕組み**:

- Chrome DevTools MCPは自動的に以下の場所にUser Data Directoryを作成:
  - **macOS/Linux**: `$HOME/.cache/chrome-devtools-mcp/chrome-profile-stable`
  - **Windows**: `%HOMEPATH%/.cache/chrome-devtools-mcp/chrome-profile-stable`
- `--isolated`フラグを指定しない限り、ログイン状態は自動的に保持される
- 初回ログイン後、セッションはブラウザ再起動後も復元される

**初回セットアップ手順**:

1. Chrome DevTools MCP を起動（上記設定で自動的にUser Data Directory作成）
2. 開いたブラウザで Google OAuth ログイン
3. ログイン状態が自動的に永続化される
4. 以降のセッションで自動的にログイン状態が復元される

**メリット**:

- ✅ 公式実装で安定したセッション管理
- ✅ 設定がシンプル（余計なパラメータ不要）
- ✅ 実際の認証フローをテスト可能
- ✅ 本番環境に近い動作確認

### 動作確認

コードを修正したら、Chrome DevTools MCPで動作確認してください。
Chrome DevTools MCPが動かない場合、Playwrightの利用に逃げず、Chrome DevTools MCPが動くように直してください。

---

## 🗄 Supabase MCP運用規約

### Read-Only設定

このプロジェクトのSupabase MCPは**読み取り専用**（`--read-only`）で設定されています。

#### 利用可能な操作

- ✅ SELECT（データ取得）
- ✅ テーブル一覧・スキーマ情報の取得
- ✅ RLS・インデックス情報の取得
- ✅ マイグレーション履歴の取得
- ✅ ログの取得
- ✅ アドバイザー情報の取得

#### 利用不可能な操作

- ❌ INSERT（データ追加）
- ❌ UPDATE（データ更新）
- ❌ DELETE（データ削除）
- ❌ マイグレーションの実行
- ❌ DDL操作（CREATE TABLE等）

**理由**: データの安全性を確保し、誤った操作によるデータ破損を防ぐため。

---
