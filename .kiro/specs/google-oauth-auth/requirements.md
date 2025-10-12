# Requirements Document

## Project Description (Input)

Google Cloudで認証を設定しました。
当プロジェクトの認証画面をemailからGoogleアカウントの方法に変更してください。

## Requirements

### Introduction

本機能は、LinkLoomの認証方式を現在のEmail/パスワード認証からGoogle OAuth 2.0認証に置き換えます。これにより、ユーザーはGoogleアカウントでシームレスにログインでき、パスワード管理の負担が軽減されます。Supabase Authの Google Providerを活用し、セキュアで信頼性の高い認証フローを実現します。

---

### Requirement 1: Google OAuth認証フロー

**目的**: ユーザーとして、Googleアカウントで簡単にログインしたい。それにより、パスワードを覚える必要がなく、安全に認証できる。

#### 認証フロー

**ログインプロセス**:
1. ユーザーが「Googleでログイン」ボタンをクリック
2. Supabase AuthがGoogle OAuth 2.0フローを開始
3. Googleログインページへリダイレクト
4. ユーザーがGoogleアカウントで認証
5. LinkLoomへコールバック（認証トークン付き）
6. Supabaseがセッションを確立
7. ダッシュボードへリダイレクト

**ログアウトプロセス**:
1. ユーザーが「ログアウト」ボタンをクリック
2. Supabaseセッションを破棄
3. ログインページへリダイレクト

#### セキュリティ要件

- HTTPS通信必須（Vercel自動対応）
- CSRF保護（Supabase標準実装）
- セッション有効期限管理（Supabaseデフォルト: 1週間）
- リフレッシュトークンによる自動セッション更新

---

### Requirement 2: Supabase Auth設定

**目的**: 管理者として、Google Cloud ConsoleとSupabaseでOAuth設定を完了したい。それにより、Google認証が正しく機能する。

#### Google Cloud Console設定

| 設定項目 | 値 |
|---------|-----|
| OAuth 2.0クライアントタイプ | ウェブアプリケーション |
| 承認済みのリダイレクトURI | `https://[project-ref].supabase.co/auth/v1/callback` |
| スコープ | `email`, `profile`, `openid` |

#### Supabase Dashboard設定

| 設定項目 | 値 |
|---------|-----|
| Provider | Google |
| Client ID | Google Cloud Consoleから取得 |
| Client Secret | Google Cloud Consoleから取得 |
| Redirect URLs | アプリケーションURL（`http://localhost:3000`, `https://yourdomain.com`） |

#### 環境変数

既存のSupabase環境変数で対応（追加不要）:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

### Requirement 3: UIコンポーネントの実装

**目的**: ユーザーとして、直感的なログインUIを利用したい。それにより、スムーズに認証できる。

#### ログインページ (`app/(auth)/login/page.tsx`)

**表示要素**:
- LinkLoomロゴ
- 「Googleでログイン」ボタン（Googleアイコン付き）
- 簡潔な説明文（「技術記事を一元管理」など）

**ボタン仕様**:
- shadcn/ui Buttonコンポーネント使用
- Googleブランドガイドライン準拠（色: `#4285F4`、アイコン）
- ホバー時の視覚的フィードバック
- クリック時にSupabase Auth Google認証を開始

#### 認証状態の表示

**ヘッダー（`components/layouts/Header.tsx`）**:
- ログイン状態: ユーザーアバター + 名前 + ログアウトボタン
- 未ログイン状態: 「ログイン」ボタン

**ユーザー情報表示**:
| 表示項目 | データソース |
|---------|-------------|
| ユーザー名 | `user.user_metadata.full_name` |
| メールアドレス | `user.email` |
| アバター画像 | `user.user_metadata.avatar_url` |

---

### Requirement 4: 認証状態管理

**目的**: 開発者として、アプリ全体で認証状態を管理したい。それにより、保護されたページやAPIへのアクセスを制御できる。

#### 認証コンテキスト

**AuthProvider実装** (`components/features/auth/AuthProvider.tsx`):
- Supabaseセッション監視
- 認証状態のグローバル提供
- セッション変更時の自動更新

**カスタムフック** (`lib/hooks/useAuth.ts`):
```typescript
interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}
```

#### ページ保護

**保護対象ページ（認証必須）**:
- `/articles` - 記事一覧
- `/articles/new` - 記事登録
- `/articles/[id]` - 記事詳細
- `/api/articles/*` - 記事API（すべてのエンドポイント）

**パブリックページ（認証不要）**:
- `/` - トップページ（ランディングまたはリダイレクト）
- `/login` - ログインページ
- `/api/health` - ヘルスチェック（存在する場合）

**実装方法**:
- Server ComponentsでSupabaseセッション確認
- 未認証時は`/login`へリダイレクト
- Middleware（`middleware.ts`）で認証チェック
- パブリックページはMiddlewareでスキップ

---

### Requirement 5: 既存Email認証からの移行

**目的**: 開発者として、Email認証コードを完全に削除したい。それにより、Google OAuth認証のみに統一できる。

#### 削除対象

**ファイル削除**:
- Email認証用コンポーネント（存在する場合）
- Email認証APIルート（存在する場合）
- パスワードリセット関連ページ（存在する場合）

**Supabase設定変更**:
| 設定項目 | 変更内容 |
|---------|---------|
| Email Provider | 無効化 |
| Google Provider | 有効化 |

#### データベース影響

**users テーブル**:
- 既存のauth.usersは維持（Supabase管理）
- 新規Google認証ユーザーは自動的にauth.usersに追加
- `email`列は引き続き使用（Googleアカウントのemail）

**articlesテーブル**:
- user_id外部キーは変更不要（auth.users.idを参照）

---

### Requirement 6: エラーハンドリング

**目的**: ユーザーとして、認証エラー時に適切なフィードバックを受けたい。それにより、問題を理解して対処できる。

#### エラーシナリオと対応

| エラーシナリオ | エラーメッセージ | ユーザーアクション |
|--------------|---------------|------------------|
| Google認証キャンセル | 「ログインがキャンセルされました」 | 再度ログインボタンをクリック |
| ネットワークエラー | 「ネットワークエラーが発生しました。もう一度お試しください」 | リトライボタン表示 |
| Supabase接続エラー | 「サーバーに接続できませんでした」 | リトライボタン + 技術サポート連絡先 |
| セッション期限切れ | 自動的にログインページへリダイレクト | 再ログイン |

**実装**:
- `sonner`トースト通知でエラー表示
- エラーログをコンソールに出力（開発環境）
- 本番環境ではユーザーフレンドリーなメッセージのみ表示

---

### Requirement 7: テスト要件

**目的**: 開発者として、Google OAuth認証が正しく動作することを検証したい。それにより、品質を担保できる。

#### ユニットテスト (Vitest)

**テスト対象**:
- `useAuth` フック
  - `signInWithGoogle()` 呼び出し時のSupabase API実行
  - `signOut()` 呼び出し時のセッション破棄
  - 認証状態の正しい更新

**テスト対象**:
- `AuthProvider` コンポーネント
  - セッション変更時の状態更新
  - 子コンポーネントへの状態提供

#### E2Eテスト (Playwright)

**テストシナリオ**:
1. **ログインフロー**:
   - ログインページ表示
   - 「Googleでログイン」ボタンクリック
   - Google認証ページへリダイレクト確認
   - （Note: 実際のGoogle認証はモックまたはスキップ）
   - ダッシュボードへの遷移確認

2. **保護されたページアクセス**:
   - 未認証で `/articles` へアクセス
   - `/login` へリダイレクト確認
   - 認証後に元のページへリダイレクト確認

3. **ログアウトフロー**:
   - ログアウトボタンクリック
   - セッション破棄確認
   - ログインページへリダイレクト確認

---

### Requirement 8: パフォーマンス要件

**目的**: ユーザーとして、スムーズな認証体験を得たい。それにより、待ち時間なくアプリを利用できる。

#### 目標値

| メトリクス | 目標値 |
|----------|--------|
| ログインボタンクリック → Googleページ表示 | < 500ms |
| Google認証完了 → ダッシュボード表示 | < 1秒 |
| ページリロード時のセッション復元 | < 300ms |

#### 最適化手法

- Supabaseクライアントのシングルトン化
- セッション情報のクライアントキャッシュ
- Server Componentsでのセッション事前取得
- ローディング状態の適切な表示

---

## 成功基準

**機能面**:
- ✅ Googleアカウントでログイン/ログアウトが正常に動作する
- ✅ 保護されたページへのアクセス制御が機能する
- ✅ エラー時に適切なメッセージが表示される
- ✅ セッションが複数デバイス間で同期される

**技術面**:
- ✅ Email認証関連コードが完全に削除されている
- ✅ Supabase Auth Google Providerが正しく設定されている
- ✅ テストカバレッジが要求を満たしている
- ✅ `npm run lint` および `npm run tsc` がエラーゼロで完了する

**UX面**:
- ✅ ログインフローが直感的で分かりやすい
- ✅ 認証エラー時のフィードバックが明確
- ✅ 認証状態の表示が適切

---

**最終更新**: 2025-10-13
**言語**: 日本語
**ステータス**: ✅ 承認済み・実装完了
**完了日**: 2025-10-13
