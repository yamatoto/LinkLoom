# Claude Code 仕様駆動開発

Claude Codeのスラッシュコマンド、フック、エージェントを使用したKiroスタイルの仕様駆動開発実装。

## プロジェクトコンテキスト

### パス
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - プロジェクト全体のルールとコンテキストでAIをガイド
**Specs** (`.kiro/specs/`) - 個別機能の開発プロセスを形式化

### アクティブな仕様
- **article-search-system** - 記事を登録して検索・一覧表示できるシステム（カード形式UI、タグフィルタリング、難易度レベル管理）
- 進捗確認: `/kiro:spec-status [feature-name]`

## 開発ガイドライン
- 思考は英語、回答の生成は日本語で行うように

## ワークフロー

### Phase 0: Steering（オプション）
`/kiro:steering` - Steeringドキュメントの作成/更新
`/kiro:steering-custom` - 専門的なコンテキスト用のカスタムSteering作成

注: 新機能や小規模な追加の場合はオプション。spec-initから直接開始できます。

### Phase 1: 仕様作成
1. `/kiro:spec-init [詳細な説明]` - 詳細なプロジェクト説明で仕様を初期化
2. `/kiro:spec-requirements [feature]` - 要件ドキュメント生成
3. `/kiro:spec-design [feature]` - インタラクティブ: "requirements.mdをレビューしましたか？ [y/N]"
4. `/kiro:spec-tasks [feature]` - インタラクティブ: 要件と設計の両方のレビューを確認

### Phase 2: 進捗追跡
`/kiro:spec-status [feature]` - 現在の進捗とフェーズを確認

## 開発ルール
1. **Steeringを考慮**: 大規模開発前に`/kiro:steering`を実行（新機能では任意）
2. **3フェーズ承認ワークフローに従う**: 要件 → 設計 → タスク → 実装
3. **承認が必要**: 各フェーズは人間のレビューが必要（インタラクティブプロンプトまたは手動）
4. **フェーズをスキップしない**: 設計は承認された要件が必要、タスクは承認された設計が必要
5. **タスクステータスを更新**: タスクに取り組む際は完了としてマーク
6. **Steeringを最新に保つ**: 大きな変更後に`/kiro:steering`を実行
7. **仕様準拠を確認**: `/kiro:spec-status`を使用して整合性を検証

## Steering設定

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
- **Conditional**: 特定のファイルパターンで読み込まれる（例: "*.test.js"）
- **Manual**: `@filename.md`構文で参照
