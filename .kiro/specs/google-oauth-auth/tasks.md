# Google OAuth認証への移行 - 実装タスク

## 実装計画

- [x] 1. Supabaseクライアント設定をOAuth対応に拡張
- [x] 1.1 SupabaseクライアントにPKCEフロー設定を追加
  - ✅ `flowType: 'pkce'`をauth設定に追加してセキュリティを強化
  - ✅ `detectSessionInUrl: true`設定がOAuthコールバック検出に有効であることを確認
  - ✅ 既存の`persistSession`と`autoRefreshToken`設定を維持
  - ✅ TypeScript型定義が正しく適用されていることを検証
  - _Requirements: 2.2（Supabase Auth設定）_
  - _実装場所: `src/lib/supabase.ts:16`_

- [x] 2. useAuthフックをGoogle OAuth機能で拡張
- [x] 2.1 Google OAuthログイン機能を実装
  - ✅ `signInWithGoogle()`メソッドを追加してSupabase OAuth APIを呼び出し
  - ✅ 認証後のリダイレクトURLを設定（開発環境と本番環境の両方）
  - ⚠️ `session`プロパティは削除（不要と判断、パフォーマンス最適化）
  - ✅ エラーハンドリングを実装して`AuthError`型を返す
  - _Requirements: 1.1（Google OAuth認証フロー）, 4.1（認証コンテキスト）_
  - _実装場所: `src/hooks/useAuth.ts:55-68`_

- [x] 2.2 Email認証メソッドを削除
  - ✅ `signIn(email, password)`メソッドを完全に削除
  - ✅ `signUp(email, password)`メソッドを完全に削除
  - ✅ 既存の`signOut()`と認証状態監視ロジックは保持
  - ✅ TypeScript型定義（`UseAuthReturn`）を更新
  - _Requirements: 5.1（既存Email認証からの移行）_
  - _実装場所: `src/hooks/useAuth.ts:8-13, 37-56`_

- [x] 3. GoogleログインUIコンポーネントを作成
- [x] 3.1 GoogleLoginButtonコンポーネントを実装
  - ✅ shadcn/ui Buttonコンポーネントを使用
  - ✅ Googleブランドガイドライン準拠のスタイル（`#4285F4`、アイコン）
  - ✅ クリック時に`signInWithGoogle()`を呼び出し
  - ✅ ローディング状態を管理してボタンを無効化
  - ✅ エラー時にsonnerトースト通知を表示（開発環境では詳細エラー）
  - _Requirements: 3.1（UIコンポーネントの実装）, 6.1（エラーハンドリング）_
  - _実装場所: `src/components/auth/GoogleLoginButton.tsx`_

- [x] 3.2 ログインページをGoogle OAuth専用UIに置き換え
  - ✅ `LoginForm`コンポーネントを削除して`GoogleLoginButton`に置き換え
  - ✅ LinkLoomロゴと説明文を表示
  - ✅ シンプルなセンタリング配置レイアウトを実装
  - ✅ Server Componentとして実装（Next.js 15ベストプラクティス）
  - ✅ 認証成功時はMiddlewareが`/`へリダイレクト処理
  - _Requirements: 3.1（UIコンポーネントの実装）, 1.1（認証フロー）_
  - _実装場所: `src/app/login/page.tsx`_

- [x] 4. ヘッダーコンポーネントに認証状態表示を追加
- [x] 4.1 ヘッダーにユーザー情報とログアウト機能を実装
  - ✅ ログイン状態: ユーザーアバター、名前、ログアウトボタンを表示
  - ✅ 未ログイン状態: 「ログイン」ボタンを表示
  - ✅ `user.user_metadata.full_name`、`user.email`、`user.user_metadata.avatar_url`を表示
  - ✅ アバター未設定時はイニシャル表示（フォールバック）
  - ✅ ログアウトボタンクリック時に`signOut()`を呼び出し
  - _Requirements: 3.2（認証状態の表示）, 1.1（ログアウトプロセス）_
  - _実装場所: `src/components/layout/Header.tsx`_

- [x] 5. Email認証関連コンポーネントとページを削除
- [x] 5.1 Email認証UIコンポーネントを削除
  - ✅ `src/components/auth/LoginForm.tsx`を削除
  - ✅ `src/components/auth/SignupForm.tsx`を削除
  - ✅ `src/app/signup/page.tsx`（サインアップページ全体）を削除
  - ✅ 削除によるインポートエラーがないことを確認（tsc --noEmit ✅）
  - _Requirements: 5.1（既存Email認証からの移行）_

- [x] 6. Middlewareをパブリックページ設定で更新
- [x] 6.1 Middlewareのパブリックルート設定を変更
  - ✅ `/signup`をパブリックルートから削除（ROUTES定数からも削除）
  - ✅ `/`をパブリックルートに追加（ランディングページ）
  - ✅ `/login`は引き続きパブリックルートとして維持
  - ✅ トークン検証ロジックは既存のまま保持
  - _Requirements: 4.2（ページ保護）, 5.1（既存Email認証からの移行）_
  - _実装場所: `src/lib/constants.ts:8-19`_

- [x] 7. エラーハンドリングとトースト通知を実装
- [x] 7.1 認証エラーシナリオのハンドリングを追加
  - ✅ Google認証キャンセル時のトースト通知実装
  - ✅ ネットワークエラー時のリトライ可能なエラー表示
  - ✅ Supabase接続エラー時のエラーメッセージ表示
  - ✅ セッション期限切れ時の自動リダイレクト処理 (useAuth.tsのSIGNED_OUTイベント)
  - _Requirements: 6.1（エラーハンドリング）_
  - _実装場所: `src/components/auth/GoogleLoginButton.tsx:16-57`, `src/hooks/useAuth.ts:82-98`_

- [x] 7.2 開発環境と本番環境のエラーログ出力を分離
  - ✅ 開発環境: 詳細なエラー情報をコンソールに出力 (logger.error with structured objects)
  - ✅ 本番環境: ユーザーフレンドリーなメッセージのみ表示
  - ✅ `AuthError`のプロパティ（`message`, `status`, `name`）をログ記録
  - _Requirements: 6.1（エラーハンドリング）_
  - _実装場所: `src/components/auth/GoogleLoginButton.tsx:43-53`, `src/components/layout/Header.tsx:20-31`, `src/hooks/useAuth.ts:61-72`_

- [x] 8. ユニットテストを実装（Vitest）
- [x] 8.1 useAuthフックのテストを作成
  - ✅ `signInWithGoogle()`呼び出しでSupabase APIが正しく実行されることを検証
  - ✅ `signOut()`呼び出しでセッション破棄と`user`が`null`になることを検証
  - ✅ `onAuthStateChange`イベント発火時の`user`状態更新を検証
  - ✅ `loading`状態の初期化と更新を検証
  - _Requirements: 7.1（ユニットテスト）_
  - _実装場所: `tests/unit/hooks/useAuth.test.ts`_

- [x] 8.2 GoogleLoginButtonコンポーネントのテストを作成
  - ✅ クリック時に`signInWithGoogle()`が呼び出されることを検証
  - ✅ ローディング中にボタンが無効化されることを検証
  - ✅ エラー時にトースト通知が表示されることを検証
  - ✅ エラー種別に応じた適切なメッセージ表示を検証（キャンセル/ネットワーク/Supabase接続）
  - ✅ 予期しないエラーのハンドリングを検証
  - _Requirements: 7.1（ユニットテスト）_
  - _実装場所: `tests/unit/components/GoogleLoginButton.test.tsx`_

- [ ] 9. E2Eテストを実装（Playwright）
- [ ] 9.1 Google OAuthログインフローのE2Eテストを作成
  - ログインページ表示時に「Googleでログイン」ボタンが表示されることを検証
  - ボタンクリック時にGoogle OAuth URLへリダイレクトされることを確認（モック）
  - モック認証成功後、ダッシュボード（`/`）へリダイレクトされることを検証
  - _Requirements: 7.2（E2Eテスト）_

- [ ] 9.2 保護されたページアクセスのE2Eテストを作成
  - 未認証状態で`/articles`にアクセス時、`/login`へリダイレクトされることを検証
  - 認証後に元のページ（`/articles`）へリダイレクトされることを検証
  - 認証済み状態で保護されたページに直接アクセスできることを検証
  - _Requirements: 7.2（E2Eテスト）, 4.2（ページ保護）_

- [ ] 9.3 ログアウトフローのE2Eテストを作成
  - ヘッダーのログアウトボタンクリック時、セッションが破棄されることを検証
  - ログアウト後、`/login`へリダイレクトされることを検証
  - ログアウト後、保護されたページにアクセス時に`/login`へリダイレクトされることを検証
  - _Requirements: 7.2（E2Eテスト）, 1.1（ログアウトプロセス）_

- [ ] 10. 統合テストとコード品質チェックを実施
- [ ] 10.1 全体統合テストを実行
  - useAuth + GoogleLoginButtonの連携動作を検証
  - Middlewareと認証状態の統合動作を検証
  - エラーハンドリングとトースト通知の連携を検証
  - _Requirements: すべての要件の統合検証_

- [ ] 10.2 コード品質と静的解析を実行
  - `npm run lint`を実行してESLintエラーゼロを確認
  - `npm run tsc`を実行してTypeScriptエラーゼロを確認
  - `npm run test`を実行してすべてのユニットテスト（Vitest）がパスすることを確認
  - `npm run test:e2e`を実行してすべてのE2Eテスト（Playwright）がパスすることを確認
  - _Requirements: すべての技術面成功基準_

---

### パフォーマンス最適化

- [x] 11.1 Headerコンポーネントの分割とメモ化
  - ✅ Logo部分を`memo`で分離して静的部分の再レンダリングを防止
  - ✅ UserSection部分を`memo`で分離
  - ✅ handleLoginClickをuseCallbackでメモ化
  - _実装場所: `src/components/layout/Header.tsx:15-77`_

### 型安全性向上

- [x] 11.2 user_metadataの型定義
  - ✅ `UserMetadata`インターフェース作成 (`full_name`, `avatar_url`)
  - ✅ Header.tsxでUserMetadata型を使用
  - ✅ useAuth.tsでUserMetadata型を使用
  - ✅ 型安全性を`Record<string, any>`から向上
  - _実装場所: `src/types/auth.ts:1-14`, `src/components/layout/Header.tsx:13,41`, `src/hooks/useAuth.ts:9`_

### セキュリティ強化

- [x] 11.3 Server Action経由の認証バイパス（Next.js 15推奨パターン）
  - ✅ `getDevAuthUser` Server Action作成
  - ✅ `NEXT_PUBLIC_DEV_AUTH_BYPASS`から`DEV_AUTH_BYPASS`に変更（クライアント公開なし）
  - ✅ useAuth.tsでServer Action経由の認証バイパス実装
  - ✅ mountedフラグで適切なクリーンアップ処理
  - _実装場所: `src/app/actions/auth.ts:1-38`, `src/hooks/useAuth.ts:24-96`_

---

## タスク実行の注意事項

### 依存関係

- タスク1-2: SupabaseクライアントとuseAuthフックの実装（他のすべてのタスクの基盤）
- タスク3-4: UIコンポーネント実装（タスク2に依存）
- タスク5-6: Email認証削除とMiddleware更新（タスク3完了後に実施）
- タスク7: エラーハンドリング（タスク3-4に統合）
- タスク8-9: テスト実装（すべての機能実装完了後）
- タスク10: 最終統合検証（すべてのテスト完了後）

### 実装順序

推奨実装順序: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

各主要タスク完了後、動作する状態でコミットすることを推奨します。
