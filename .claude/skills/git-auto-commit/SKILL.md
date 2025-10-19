---
name: Git Auto Commit
description: Automatically generate commit messages following Conventional Commits format, commit changes, and push to remote. Use when committing code changes to main branch.
---

# Git Auto Commit

このスキルは、個人開発プロジェクト向けのGit操作を自動化します。

## このスキルができること

1. **コミットメッセージの自動生成**: git diffを分析し、変更内容に基づいた明確なコミットメッセージを生成
2. **自動コミット**: 生成したメッセージでコミットを実行
3. **自動プッシュ**: mainブランチへプッシュ

## ワークフロー

### 1. 変更内容の分析

まず`git status`と`git diff`で変更内容を確認します：

```bash
git status
git diff --staged  # ステージング済みの変更
git diff           # 未ステージングの変更
```

### 2. コミットメッセージの生成

**Conventional Commits形式**で生成します：

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Type（種類）**:
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正
- `perf`: パフォーマンス改善
- `chore`: ビルド・補助ツール修正

**Scope（範囲）**:
- `auth`: 認証機能
- `api`: API実装
- `ui`: UI実装
- `config`: 設定
- `test`: テスト
- `spec`: 仕様
- 等

**Subject（概要）**:
- 50文字以内
- 日本語OK
- 末尾にピリオド不要

**Body（詳細）**:
- 変更の背景、目的、影響範囲
- 主要な変更点
- 必要に応じて箇条書き

### 3. コミットの実行

ステージングされていない変更がある場合は、まず`git add`を実行してからコミットします。

```bash
git add .
git commit -m "メッセージ"
```

### 4. プッシュの実行

mainブランチへ自動的にプッシュします：

```bash
git push origin main
```

## 使用例

### 例1: 基本的なコミット＆プッシュ

```
ユーザー: 変更をコミットしてプッシュしてください
```

スキルが実行すること：

1. `git status`と`git diff`で変更を確認
2. Conventional Commits形式でコミットメッセージを生成・提案
3. ユーザー承認後、コミット実行
4. mainブランチへプッシュ

### 例2: コミットのみ（プッシュなし）

```
ユーザー: 変更をコミットしてください（プッシュはまだしないで）
```

スキルが実行すること：

1. 変更内容を分析
2. コミットメッセージを生成・コミット
3. プッシュは実行しない

### 例3: 複数の変更を一度にコミット

```
ユーザー: 認証関連の変更をすべてコミットして
```

スキルが実行すること：

1. 関連する変更をまとめて確認
2. スコープ付きコミットメッセージを生成（例: `feat(auth): Google OAuth認証を実装`）
3. コミット・プッシュ

## 注意事項

- **テスト実行**: コミット前に `npm run lint` と `npm run tsc` を実行（CLAUDE.mdの品質原則）
- **Co-Authored-By**: 必ず `Co-Authored-By: Claude <noreply@anthropic.com>` を追加
- **Claude Code署名**: 必ず `🤖 Generated with [Claude Code](https://claude.com/claude-code)` を追加

## トラブルシューティング

### プッシュが失敗する場合

- リモートブランチとの競合がないか確認
- `git pull --rebase origin main`で最新の変更を取り込んでから再度プッシュ

### コミットメッセージが適切でない場合

- 変更内容を明確に説明してからコミット
- 必要に応じてスコープを調整

### lint/TypeScriptエラーがある場合

- コミット前に必ず修正（CLAUDE.mdの品質原則）
- `npm run lint`と`npm run tsc`を実行して確認
