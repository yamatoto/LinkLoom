# 記事一覧表示機能 - 概要

## 目的
登録した記事をカード形式で一覧表示し、ユーザーが保存した記事を素早く閲覧できるようにする。

## 何を作るか
- `/articles` ページで記事一覧を表示
- カード形式のUI（プラットフォームアイコン、タイトル、説明、タグ、登録日）
- ローディング・エラー状態の適切なハンドリング

## なぜ必要か
- ユーザーが登録した記事を確認できる
- MVP（Phase 1）の基本機能として必須
- 次のフェーズ（検索・フィルタリング）の基盤となる

## どこに実装するか
- `src/app/articles/page.tsx` - 一覧ページ（Server Component）
- `src/components/articles/ArticleCard.tsx` - 記事カード
- `src/components/articles/ArticleList.tsx` - 記事一覧コンテナ
- `src/app/actions/articles.ts` - データフェッチ（getArticles追加）
