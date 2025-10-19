# Security Review Guidelines

## LinkLoomプロジェクトのセキュリティレビュー観点

**技術スタック固有のセキュリティ:**
- Supabase Auth (Google OAuth)
- Next.js 15 App Router (middleware.ts)
- @supabase/ssr

## セキュリティレビューの重要観点

### 1. SQLインジェクション対策（Supabase使用）

#### ✅ Good: SupabaseのクエリAPI（安全）
```typescript
// ✅ Supabaseのクエリビルダー（自動エスケープ）
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', userInput);  // ✅ 安全（自動エスケープ）

// ✅ RPC（Stored Procedure）も安全
const { data, error } = await supabase
  .rpc('get_user_by_email', { email: userInput });
```

#### ❌ Bad: 生SQLの文字列結合（通常使用しない）
```typescript
// ❌ 危険: 生SQLは使用しない（Supabaseでは基本的に不要）
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
// Supabaseのクエリビルダーを使用すれば自動的に安全
```

**Note**: Supabaseは内部的にPostgRESTを使用しており、クエリビルダーAPIは自動的にパラメータ化されているため安全です。

### 2. XSS（クロスサイトスクリプティング）対策

#### ✅ Good: 入力のサニタイズ
```typescript
import DOMPurify from 'isomorphic-dompurify';

// HTMLをサニタイズ
const safeHtml = DOMPurify.sanitize(userInput);
```

#### ❌ Bad: 生のHTML挿入
```typescript
// ❌ 危険: XSSの脆弱性
element.innerHTML = userInput;
```

### 3. 認証・認可（Supabase Auth + Next.js Middleware）

#### ✅ Good: Supabase Authの適切な使用
```typescript
// ✅ middleware.ts: Next.jsミドルウェアで認証チェック
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッション確認
  const { data: { session } } = await supabase.auth.getSession()

  // 未認証の場合はログインページへリダイレクト
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

#### ✅ Good: Row Level Security (RLS)の活用
```sql
-- ✅ Supabase RLS: ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can only view their own data"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);
```

#### ❌ Bad: 認証チェックなし
```typescript
// ❌ 危険: 認証チェックなし
export default async function DashboardPage() {
  // 認証チェックなしでデータ表示
  const projects = await getProjects();  // 誰でもアクセス可能
  return <ProjectList projects={projects} />;
}
```

### 4. 機密情報の扱い（Next.js環境変数）

#### ✅ Good: 環境変数の使用（NEXT_PUBLIC_プレフィックス注意）
```typescript
// ✅ サーバーサイド専用環境変数（ブラウザに公開されない）
const dbPassword = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ クライアントサイド公開環境変数（NEXT_PUBLIC_プレフィックス）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

#### ❌ Bad: 機密情報をNEXT_PUBLIC_で公開
```typescript
// ❌ 危険: サービスロールキーをNEXT_PUBLIC_で公開
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;  // ブラウザに公開される！

// ❌ 危険: 機密情報のハードコード
const apiKey = 'sk-1234567890abcdef';
```

**重要**:
- `NEXT_PUBLIC_`プレフィックスの環境変数はブラウザに公開される
- サービスロールキーなど機密情報には`NEXT_PUBLIC_`を使わない
- Supabase Anon Keyは公開用なので`NEXT_PUBLIC_`を使用してOK

### 5. ログ出力の安全性

#### ✅ Good: 機密情報を除外
```typescript
// パスワードを除外してログ出力
const { password, ...safeUser } = user;
logger.info('User created', { user: safeUser });
```

#### ❌ Bad: 機密情報をログ出力
```typescript
// ❌ 危険: パスワードやトークンをログ出力
logger.info('User login', { email, password });  // パスワードがログに残る
logger.error('API Error', { token });  // トークンがログに残る
```

### 6. 入力バリデーション

#### ✅ Good: 厳格なバリデーション
```typescript
import { z } from 'zod';

// Zodでバリデーション
const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'user', 'guest'])
});

// バリデーション実行
const validateUser = (input: unknown) => {
  return UserSchema.parse(input);  // エラー時は例外をスロー
};
```

#### ❌ Bad: バリデーションなし
```typescript
// ❌ 危険: 入力値をそのまま使用
const createUser = async (input: any) => {
  return await User.create(input);  // 任意のフィールドを受け入れる
};
```

## 危険なパターン

### 絶対に使ってはいけない

```typescript
// ❌ eval()の使用
eval(userInput);

// ❌ Function()コンストラクタ
const fn = new Function('x', userInput);

// ❌ 動的なrequire()
require(userInput);

// ❌ child_process with user input
exec(`ls ${userInput}`);
```

## チェックリスト

### 認証・認可
- [ ] 認証トークンが適切に検証されているか
- [ ] 認可チェックが実装されているか（権限確認）
- [ ] セッション管理が安全か

### 入力処理
- [ ] すべてのユーザー入力がバリデーションされているか
- [ ] SQLインジェクション対策が施されているか
- [ ] XSS対策が施されているか
- [ ] ファイルアップロードの制限が適切か

### 機密情報
- [ ] パスワードやトークンがハードコードされていないか
- [ ] 環境変数が適切に使われているか
- [ ] ログに機密情報が含まれていないか
- [ ] エラーメッセージに機密情報が含まれていないか

### データアクセス
- [ ] ORMが適切に使われているか（生SQL回避）
- [ ] パラメータ化クエリが使われているか
- [ ] アクセス権限が適切にチェックされているか

### その他
- [ ] CORS設定が適切か
- [ ] HTTPS通信が強制されているか
- [ ] セキュリティヘッダーが設定されているか
- [ ] 依存パッケージに脆弱性がないか（npm audit）
