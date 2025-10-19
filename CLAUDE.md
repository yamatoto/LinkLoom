# LinkLoom 開発ガイドライン

このドキュメントはClaude Codeによる開発時のガイドラインです。

**プロジェクト概要・進捗**: [docs/plan.md](./docs/plan.md) を参照してください。

---

## 🎯 コア原則（絶対厳守）

### 1. plan.md更新は必ずユーザー許可後
- **絶対に勝手にplan.mdを更新しない**
- 完了確認メッセージでユーザーの許可を得てから更新

### 2. 品質基準をクリアしてから完了
- 静的解析（lint, tsc）エラーゼロ
- すべてのテスト合格
- コードレビュー指摘すべて対応済み
- 「後で修正」「動くけど品質に課題」は完了ではない

### 3. プロアクティブな品質管理
- 設定ファイルは作成時点で最適化（tsconfig.json, .eslintrc.json等）
- ユーザー指摘前に問題発見・修正
- プロダクション品質を目指す（セキュリティ、保守性、パフォーマンス）

---

## 🔄 実装ワークフロー

### ステップ1: 実装
- 仕様（`specs/[feature-name]/`）に基づいて実装
- テストも同時に作成（TDD推奨）

### ステップ2: 品質チェック（この順序で実行）

#### 2-1. テスト実行
```bash
# ユニット/統合テスト
npm run test

# E2Eテスト（Chrome DevTools MCP使用）
npm run dev  # 開発サーバー起動
# Chrome DevTools MCPでブラウザ操作
```

**注意**: `npm run test:e2e`は使用禁止（HTMLダッシュボードが開き非効率）

#### 2-2. 静的解析
```bash
npm run lint && npm run tsc
```
→ エラーゼロになるまで修正

#### 2-3. Chrome DevTools MCPで動作確認
```bash
npm run dev
# browser_navigate → browser_click → browser_snapshot で確認
```

#### 2-4. コードレビュー
```bash
# Agent Skill実行
multi-expert-code-review
```

**指摘への対応ループ**:
1. レビュー指摘を確認
2. **小規模修正**: 即座に対応 → **ステップ2-1（テスト）から再実行** → 再レビュー
3. **大規模修正**: `docs/review-feedback/[date]_[feature-name].md`にドキュメント化 → ユーザー確認

**重要**:
- コード変更後は必ずテスト・静的解析を再実行してから再レビュー
- すべての指摘（Critical/Warning/Suggestion）をクリアするまでループ

### ステップ3: 完了確認（必ずこの形式で報告）

```markdown
✅ [機能名]が完全に完了しました

実装内容:
- [実装した内容を箇条書き]

完了条件:
- ✅ すべてのテスト合格（[N]件）
- ✅ 静的解析クリア（lint, tsc）
- ✅ Chrome DevTools MCP動作確認
- ✅ コードレビュー指摘事項すべて対応済み

このタスクを完了として良いですか？
許可いただければ、docs/plan.md の進捗を更新します。
```

---

## 🛠 開発ツール・環境

### 開発サーバー
```bash
npm run dev  # http://localhost:3000
```

### テスト詳細
- **ユニット/統合**: Vitest（`tests/unit/`, `tests/integration/`）
- **E2E**: Playwright（`tests/e2e/`）※Chrome DevTools MCP経由で実行
- **詳細**: [tests/README.md](./tests/README.md) 参照

### カスタムコマンド（`/my:` プレフィックス）
- **brainstorm** - 要件の深掘り
- **design** - 設計支援
- **implement** - 実装支援
- **test** - テスト支援
- **analyze** - コード品質分析
- **improve** - コード改善
- **troubleshoot** - 問題診断
- **git** - Gitコミット支援

### Agent Skills
- **multi-expert-code-review**: 5人の専門家による並列コードレビュー（実装完了時に必須）
- **git-auto-commit**: Conventional Commits形式でのコミット・プッシュ
- **spec-brainstorm-doc**: Socratic対話による仕様ブレインストーミング

### 軽量仕様駆動開発
```
specs/
└── [feature-name]/
    ├── brief.md      # 概要（5-10行）
    ├── design.md     # 設計メモ（10-20行）
    └── tasks.md      # タスク一覧（TodoWrite形式）
```

---

## 🔧 MCPツール

### Chrome DevTools MCP
- **自動セッション管理**: `~/.cache/chrome-devtools-mcp/chrome-profile-stable`
- **初回セットアップ**: MCP起動 → Google OAuthログイン → 以降自動復元
- **E2Eテスト**: このMCP経由で実行（Playwrightコマンドは使用しない）

### Supabase MCP
- **読み取り専用**（`--read-only`）
- ✅ SELECT、スキーマ情報取得、ログ取得
- ❌ INSERT/UPDATE/DELETE、マイグレーション実行

### MCPツールが動作しない場合の対応
1. **エラーメッセージを正確に読む** → 根本原因を特定
2. **ツール定義を確認** → 正しいパラメータ名・型を確認
3. **問題を修正** → 正しいパラメータで再試行
4. **MCPツール自体のバグの場合** → 回避策を提案してユーザー確認後に実装

**例**:
```typescript
// ❌ 誤り: refパラメータ（Chrome DevTools MCPには存在しない）
<parameter name="ref">4_23</parameter>

// ✅ 正しい: uidパラメータ
<parameter name="uid">4_23</parameter>
```

**理由**: 回避策に逃げると根本問題が放置され、品質が低下する

---

## 📋 クイックリファレンス

### 新機能開発フロー
1. `specs/[feature-name]/`に仕様作成（brief.md, design.md, tasks.md）
2. 実装（テストも同時作成）
3. 品質チェック（テスト → lint → 動作確認 → レビュー）
4. 完了確認（ユーザー許可 → plan.md更新）

### 完了判定チェックリスト
- [ ] すべてのテストが通っている
- [ ] 静的解析（lint, tsc）がエラーゼロ
- [ ] Chrome DevTools MCPで動作確認済み
- [ ] コードレビュー指摘すべて対応済み
- [ ] ユーザーから完了許可を得た

---
