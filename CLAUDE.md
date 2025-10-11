# LinkLoom プロジェクト開発ガイド

このプロジェクトでは、**cc-sdd（Kiro仕様駆動開発）**と**SuperClaude**の2つの強力なツールを組み合わせて開発を進めます。

## 🎯 プロジェクトの目的

記事を登録して検索・一覧表示できるシステムを構築します。

## 🛠 利用可能なツール

### 1. cc-sdd（Kiro仕様駆動開発）

仕様駆動開発のための体系的なワークフローツール

**パス:**

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/kiro/`

**Steering vs Specification:**

- **Steering** (`.kiro/steering/`) - プロジェクト全体のルールとコンテキストでAIをガイド
- **Specs** (`.kiro/specs/`) - 個別機能の開発プロセスを形式化

**アクティブな仕様:**

- **google-oauth-auth** - Google OAuth認証への移行（Email認証からGoogle Cloud OAuth 2.0への置き換え）
  - 状態: initialized
  - 進捗確認: `/kiro:spec-status google-oauth-auth`

### 2. SuperClaude

専門サブエージェントによる高度な開発支援フレームワーク

**利用可能なサブエージェント:** (`/sc:` プレフィックス)

- **analyze** - コード品質、セキュリティ、パフォーマンス、アーキテクチャの包括的分析
- **brainstorm** - ソクラティックな対話による要件発見と創造的問題解決
- **build** - ビルド、コンパイル、パッケージングの自動化とエラーハンドリング
- **business-panel** - ビジネス専門家パネルによる戦略分析
- **cleanup** - デッドコード削除とプロジェクト構造の最適化
- **design** - システムアーキテクチャ、API、コンポーネント設計
- **document** - コンポーネント、関数、API、機能のドキュメント生成
- **estimate** - タスク、機能、プロジェクトの開発見積もり
- **explain** - コード、概念、システム動作の明確な説明
- **git** - インテリジェントなコミットメッセージとGitワークフロー最適化
- **implement** - ペルソナ統合による機能・コード実装
- **improve** - コード品質、パフォーマンス、保守性の体系的改善
- **index** - プロジェクトドキュメントと知識ベースの包括的生成
- **load** - Serena MCP統合によるセッションコンテキストのロード
- **reflect** - Serena MCP分析によるタスクの振り返りと検証
- **research** - 適応型プランニングとインテリジェント検索による深い調査
- **save** - Serena MCP統合によるセッションコンテキストの永続化
- **select-tool** - 複雑性スコアリングによる最適なMCPツール選択
- **spec-panel** - 著名な仕様エンジニアリング専門家によるマルチレビュー
- **task** - インテリジェントなワークフロー管理と委譲
- **test** - カバレッジ分析と自動品質レポート
- **troubleshoot** - コード、ビルド、デプロイメント、システム動作の問題診断と解決
- **workflow** - PRDと機能要件から構造化実装ワークフローの生成

## 開発ガイドライン

### 基本原則

- 思考は英語、回答の生成は日本語で行うように
- 適切な場面でSuperClaudeのサブエージェントを積極的に活用する
- 複雑な分析には `/sc:analyze`、設計には `/sc:design`、実装には `/sc:implement` を使用
- セッション管理には `/sc:load` と `/sc:save` を活用
- **簡潔さを優先**: 形式や記法に固執せず、読みやすさと実用性を重視する

### 品質原則：専門家基準の徹底

**コア原則:**
SuperClaudeは既に専門知識を持っている。CLAUDE.mdに具体例が書かれていなくても、**常に専門家レベルの品質**を提供すること。

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

4. **詳細な技術仕様は `.kiro/steering/tech.md` を参照**
   - プロジェクト固有の技術方針
   - バージョン管理戦略
   - 推奨ライブラリとその理由

5. **静的解析エラーゼロで作業完了**
   - 作業完了前に必ず `npm run lint` と `npm run tsc` を実行
   - すべてのlintエラー・TypeScriptエラーを修正してから完了報告
   - 「エラーは後で修正してください」という対応は厳禁
   - プロダクション品質を維持するための絶対的な品質ゲート

#### 自動化の原則

- CLAUDE.mdに具体例を書く必要はない（SuperClaudeが既に知識を持っている）
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

### 統合ワークフロー（cc-sdd + SuperClaude）

#### Phase 0: プロジェクト準備

1. **セッションロード**: `/sc:load` - 前回のセッションコンテキストを復元
2. **Steering作成**（大規模開発時）: `/kiro:steering` - プロジェクト全体ルール定義
3. **要件ブレインストーミング**（必要時）: `/sc:brainstorm` - ソクラティック対話で要件を深掘り

#### Phase 1: 仕様作成（cc-sdd）

1. `/kiro:spec-init [詳細な説明]` - 仕様を初期化
2. `/kiro:spec-requirements [feature]` - 要件ドキュメント生成
   - **活用**: `/sc:spec-panel` で仕様の専門家レビュー
3. `/kiro:spec-design [feature]` - 技術設計ドキュメント生成
   - **活用**: `/sc:design` でアーキテクチャ設計支援
   - **活用**: `/kiro:validate-design [feature]` で設計品質レビュー
4. `/kiro:spec-tasks [feature]` - 実装タスク生成
   - **活用**: `/sc:estimate` でタスク見積もり

#### Phase 2: 実装（cc-sdd + SuperClaude連携）

1. `/kiro:spec-impl [feature] [task-numbers]` - TDD手法でタスク実装
   - **活用**: `/sc:implement` でペルソナ統合実装
   - **活用**: `/sc:task` で複雑なマルチステップ実装の委譲
2. **継続的品質管理**:
   - `/sc:analyze` - コード品質・セキュリティ分析
   - `/sc:test` - カバレッジ分析とテスト実行
   - `/sc:improve` - リファクタリングと最適化

#### Phase 3: デプロイと保守

1. `/sc:build` - ビルドとパッケージング
2. `/sc:git` - インテリジェントなGitコミット
3. `/sc:document` - ドキュメント生成
4. `/sc:save` - セッションコンテキストを保存

#### Phase 4: トラブルシューティング

- `/sc:troubleshoot` - 問題の診断と解決
- `/kiro:validate-gap [feature]` - 実装と要件のギャップ分析
- `/sc:reflect` - タスクの振り返りと検証

### 進捗管理

- `/kiro:spec-status [feature]` - 現在の仕様進捗確認
- `/sc:reflect` - 実装の振り返りと品質検証

## 📋 開発ルール

### cc-sdd ルール

1. **Steeringを考慮**: 大規模開発前に`/kiro:steering`を実行（新機能では任意）
2. **3フェーズ承認ワークフローに従う**: 要件 → 設計 → タスク → 実装
3. **承認が必要**: 各フェーズは人間のレビューが必要（インタラクティブプロンプトまたは手動）
4. **フェーズをスキップしない**: 設計は承認された要件が必要、タスクは承認された設計が必要
5. **タスクステータスを更新**: タスクに取り組む際は完了としてマーク
6. **Steeringを最新に保つ**: 大きな変更後に`/kiro:steering`を実行
7. **仕様準拠を確認**: `/kiro:spec-status`を使用して整合性を検証

### SuperClaude 活用ガイドライン

1. **適切なエージェント選択**: タスクの性質に応じて最適なサブエージェントを選択
   - 分析・診断 → `/sc:analyze`, `/sc:troubleshoot`
   - 設計・アーキテクチャ → `/sc:design`, `/sc:workflow`
   - 実装 → `/sc:implement`, `/sc:task`
   - 品質改善 → `/sc:improve`, `/sc:cleanup`, `/sc:test`
   - 調査・学習 → `/sc:research`, `/sc:explain`
   - ドキュメント → `/sc:document`, `/sc:index`

2. **セッション管理**: 作業開始時に`/sc:load`、終了時に`/sc:save`を実行
3. **複雑タスクの委譲**: 3ステップ以上の複雑な作業は`/sc:task`や`/sc:spawn`に委譲
4. **継続的品質管理**: 実装後は必ず`/sc:analyze`と`/sc:test`で品質チェック
5. **振り返り**: 重要なタスク完了後は`/sc:reflect`で振り返りを実施

## ⚙️ Steering設定（cc-sdd）

### 現在のSteeringファイル

`/kiro:steering`コマンドで管理。ここでの更新はコマンド変更を反映します。

### アクティブなSteeringファイル

- `product.md`: 常に含まれる - 製品コンテキストとビジネス目標
- `tech.md`: 常に含まれる - 技術スタックとアーキテクチャ決定
- `structure.md`: 常に含まれる - ファイル構成とコードパターン

### カスタムSteeringファイル

<!-- /kiro:steering-customコマンドで追加 -->
<!-- フォーマット:
- `filename.md`: モード - パターン - 説明
  モード: Always|Conditional|Manual
  パターン: Conditionalモード用のファイルパターン
-->

### 包含モード

- **Always**: すべてのインタラクションで読み込まれる（デフォルト）
- **Conditional**: 特定のファイルパターンで読み込まれる（例: "\*.test.js"）
- **Manual**: `@filename.md`構文で参照

---

## 💡 クイックスタートガイド

### 新機能を開発する場合

```bash
# 1. セッションロード（初回以降）
/sc:load

# 2. 要件をブレインストーミング（必要時）
/sc:brainstorm

# 3. 仕様を初期化
/kiro:spec-init [詳細な説明]

# 4. 要件を生成
/kiro:spec-requirements [feature-name]

# 5. 設計を生成（要件承認後）
/kiro:spec-design [feature-name] -y

# 6. タスクを生成（設計承認後）
/kiro:spec-tasks [feature-name] -y

# 7. 実装開始
/kiro:spec-impl [feature-name] [task-numbers]

# 8. 品質チェック
/sc:analyze
/sc:test

# 9. セッション保存
/sc:save
```

### 既存コードを改善する場合

```bash
# 1. 分析
/sc:analyze

# 2. 問題診断（エラーがある場合）
/sc:troubleshoot

# 3. 改善実行
/sc:improve

# 4. テスト
/sc:test

# 5. リファクタリング
/sc:cleanup
```

### ドキュメントを作成する場合

```bash
# コンポーネント/関数ドキュメント
/sc:document

# プロジェクト全体のインデックス
/sc:index
```

### 動作確認

Chrome DevTools MCPで 動作確認してください。
Chrome DevTools MCPが動かない場合、Playwright の利用に逃げず、Chrome DevTools MCPが動くように直してください。
