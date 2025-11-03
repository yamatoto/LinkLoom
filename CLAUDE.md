# LinkLoom 開発ガイドライン

このドキュメントはClaude Codeによる開発時のガイドラインです。

---

## ⚠️ 最重要ルール（必読）

**[AGENTS.md](./AGENTS.md) を必ず確認し、厳守すること。**

特に以下のルールは絶対厳守：
- タスク完了後、**コミットとplan.md編集は禁止**。必ずユーザーへ報告し指示を待つ
- すべての運用ルール・ワークフローはAGENTS.mdに記載

---

## 📚 プロジェクト概要・進捗

[docs/plan.md](./docs/plan.md) を参照してください。

---

## 🛠 開発ツール・環境

### 開発サーバー

```bash
npm run dev  # http://localhost:3000
```

### テスト詳細

- **ユニット/統合**: Vitest（`tests/unit/`, `tests/integration/`）
  - コマンド: `npm run test`
- **E2E**: Playwright（`tests/e2e/`）
  - **AI実行用**: `npm run e2e:ci`（CLI出力のみ）
  - **人間用**: `npm run e2e`（HTMLダッシュボード表示）
- **詳細**: [tests/README.md](./tests/README.md) 参照

### Agent Skills

- **multi-expert-code-review**: 5人の専門家による並列コードレビュー（実装完了時に必須）
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

## 💻 コーディング規約

### TypeScript

- アロー関数を使用
- Enum非推奨（union typeを使用）
- `any`禁止。公開APIは型を明示
- 早期return、浅いネスト
- 不要なtry/catch禁止
- 意味的な命名
- 既存のLint/Formatに完全準拠、無関係な整形変更禁止

### コメント

- 非自明な意図・前提・落とし穴のみ記載
- 自明なコードにコメント不要

### テスト

- プロジェクトの既定ランナー（Jest/Vitest）に従う
- `test` を使用、テスト名は日本語
- フロントエンドのE2EはPlaywright（CI想定コマンドを使用）

---

## 🔒 セキュリティ

- 秘密情報は環境変数で管理。コード/ログ/テストへの直書き禁止
- 最小権限・HTTPS前提

---

## 📝 ドキュメント

- 重要な設計判断は `docs/` または `specs/` に記録
- 一時的なメモは `docs/memo/` に配置

---

## 参考リンク

- [tests/README.md](./tests/README.md) - テストガイドライン
- [docs/database-schema-implementation.md](./docs/database-schema-implementation.md) - データベース設計
- [specs/README.md](./specs/README.md) - 仕様駆動開発ガイド
