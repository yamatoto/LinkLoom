---
description: 詳細なプロジェクト説明と要件で新規仕様を初期化
allowed-tools: Bash, Read, Write, Glob
argument-hint: <project-description>
---

# 仕様初期化

提供されたプロジェクト説明に基づいて新規仕様を初期化します:

**プロジェクト説明**: $ARGUMENTS

## タスク: 仕様構造の初期化

**範囲**: このコマンドは、提供された詳細なプロジェクト説明に基づいてディレクトリ構造とメタデータを初期化します。

### 1. 機能名の生成

プロジェクト説明（$ARGUMENTS）から簡潔で説明的な機能名を作成します。
**既存の`.kiro/specs/`ディレクトリを確認して、生成された機能名が一意であることを確認してください。競合が存在する場合は、数字のサフィックスを追加します（例: feature-name-2）。**

### 2. 仕様ディレクトリの作成

`.kiro/specs/[generated-feature-name]/`ディレクトリを以下のファイルで作成:

- `spec.json` - メタデータと承認追跡
- `requirements.md` - プロジェクト説明を含む軽量テンプレート

**注意**: design.mdとtasks.mdは、開発プロセス中にそれぞれのコマンドによって作成されます。

### 3. spec.jsonメタデータの初期化

承認追跡を含む初期メタデータを作成:

```json
{
  "feature_name": "[generated-feature-name]",
  "created_at": "current_timestamp",
  "updated_at": "current_timestamp",
  "language": "ja",
  "phase": "initialized",
  "approvals": {
    "requirements": {
      "generated": false,
      "approved": false
    },
    "design": {
      "generated": false,
      "approved": false
    },
    "tasks": {
      "generated": false,
      "approved": false
    }
  },
  "ready_for_implementation": false
}
```

### 4. 要件テンプレートの作成

プロジェクト説明を含むrequirements.mdを作成:

```markdown
# Requirements Document

## Project Description (Input)

$ARGUMENTS

## Requirements

<!-- Will be generated in /kiro:spec-requirements phase -->
```

### 5. CLAUDE.md参照の更新

生成された機能名と簡単な説明を含めて、アクティブな仕様リストに新しい仕様を追加します。

## 初期化後の次のステップ

厳格な仕様駆動開発ワークフローに従ってください:

1. **`/kiro:spec-requirements <feature-name>`** - requirements.mdを作成して生成
2. **`/kiro:spec-design <feature-name>`** - design.mdを作成して生成（承認された要件が必要）
3. **`/kiro:spec-tasks <feature-name>`** - tasks.mdを作成して生成（承認された設計が必要）

**重要**: 各フェーズはそれぞれのファイルを作成し、次のフェーズに進む前に承認が必要です。

## 出力形式

初期化後、以下を提供します:

1. 生成された機能名と根拠
2. 簡単なプロジェクト概要
3. 作成されたspec.jsonのパス
4. **明確な次のステップ**: `/kiro:spec-requirements <feature-name>`
5. ステージごとの開発原則に従って、spec.jsonのみが作成されたことの説明
