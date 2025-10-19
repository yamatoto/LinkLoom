# 検索・フィルタリング機能 - 概要

## 目的
記事一覧ページでキーワード検索・タグフィルタ・ソート機能を提供し、ユーザーが目的の記事を素早く見つけられるようにする。

## 何を作るか
- キーワード検索（タイトル・説明文から検索）
- タグフィルタ（複数選択可能、AND条件）
- ソート順選択（登録日順、更新日順）
- 検索結果件数の表示
- 検索条件のクリア機能

## なぜ必要か
- 記事が増えた際に目的の記事を素早く探せる
- タグで記事を分類・絞り込める
- MVP（Phase 1）の基本機能として必須

## どこに実装するか
- `src/components/articles/SearchBar.tsx` - キーワード検索UI
- `src/components/articles/TagFilter.tsx` - タグフィルタUI
- `src/components/articles/SortSelector.tsx` - ソート順選択UI
- `src/app/actions/articles.ts` - searchArticles Server Action追加
- `src/app/articles/page.tsx` - 検索機能統合
