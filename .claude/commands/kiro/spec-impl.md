---
description: TDD方法論を使用して仕様タスクを実行
allowed-tools: Bash, Read, Write, Edit, MultiEdit, Grep, Glob, LS, WebFetch, WebSearch
argument-hint: <feature-name> [task-numbers]
---

# TDDによる仕様タスク実行

Kent BeckのTest-Driven Development方法論を使用して、**$1**の実装タスクを実行します。

## 指示

### 実行前検証

機能 **$1** に必要なファイルが存在することを検証:

- 要件: `.kiro/specs/$1/requirements.md`
- 設計: `.kiro/specs/$1/design.md`
- タスク: `.kiro/specs/$1/tasks.md`
- メタデータ: `.kiro/specs/$1/spec.json`

### コンテキスト読み込み

**コアSteering:**

- 構造: @.kiro/steering/structure.md
- 技術スタック: @.kiro/steering/tech.md
- プロダクト: @.kiro/steering/product.md

**カスタムSteering:**

- `.kiro/steering/`内の追加`*.md`ファイル（structure.md、tech.md、product.mdを除く）

**$1の仕様ドキュメント:**

- メタデータ: @.kiro/specs/$1/spec.json
- 要件: @.kiro/specs/$1/requirements.md
- 設計: @.kiro/specs/$1/design.md
- タスク: @.kiro/specs/$1/tasks.md

### タスク実行

1. **機能**: $1
2. **タスク番号**: $2（オプション、デフォルトはすべての未完了タスク）
3. **すべてのコンテキストを読み込み**（Steering + 仕様ドキュメント）
4. **選択されたタスクを実行** TDD方法論を使用

### TDD実装

選択された各タスクについて:

1. **RED**: 最初に失敗するテストを書く
2. **GREEN**: テストをパスする最小限のコードを書く
3. **REFACTOR**: コード構造をクリーンアップして改善
4. **検証**:
   - すべてのテストがパス
   - 既存のテストに退行がない
   - コード品質とテストカバレッジが維持されている
5. **完了マーク**: tasks.mdでチェックボックスを`- [ ]`から`- [x]`に更新

**注意**: Kent BeckのTDD方法論に厳密に従い、特定のタスク要件のみを実装してください。

## 実装ノート

- **機能**: 機能名に`$1`を使用
- **タスク**: 特定のタスク番号に`$2`を使用（オプション）
- **検証**: すべての必要な仕様ファイルが存在することを確認
- **TDDフォーカス**: 常に実装前にテストを書く
- **タスクトラッキング**: 完了したらtasks.mdでチェックボックスを更新
