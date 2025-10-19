# Architecture Review Guidelines

## LinkLoomプロジェクトのアーキテクチャパターン

### ディレクトリ構造

```
LinkLoom/
├── src/
│   ├── app/              # Next.js 15 App Router（ルーティング）
│   │   ├── (auth)/       # 認証関連ページ
│   │   ├── (dashboard)/  # ダッシュボード関連ページ
│   │   ├── actions/      # Server Actions
│   │   ├── api/          # API Routes
│   │   └── layout.tsx    # ルートレイアウト
│   ├── components/       # Reactコンポーネント
│   │   ├── auth/         # 認証関連コンポーネント
│   │   ├── ui/           # 共通UIコンポーネント
│   │   └── layouts/      # レイアウトコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── lib/              # ユーティリティ・ライブラリ
│   │   ├── supabase.ts   # Supabaseクライアント
│   │   ├── logger.ts     # ロガー
│   │   └── utils.ts      # ユーティリティ関数
│   ├── services/         # ビジネスロジック層
│   ├── stores/           # Zustandストア
│   ├── types/            # TypeScript型定義
│   └── middleware.ts     # Next.jsミドルウェア（認証）
├── tests/                # テスト
│   ├── unit/             # ユニットテスト（Vitest）
│   ├── e2e/              # E2Eテスト（Playwright）
│   └── mocks/            # モックデータ
├── specs/                # 軽量仕様ドキュメント
└── public/               # 静的ファイル
```

### アーキテクチャレイヤー

LinkLoomは以下のレイヤー構造を持ちます：

```
┌─────────────────────────────────────┐
│  Presentation Layer                 │  Next.js App Router (Server/Client Components)
│  - app/                             │
│  - components/                      │
├─────────────────────────────────────┤
│  Logic Layer                        │  カスタムフック・ストア
│  - hooks/                           │
│  - stores/ (Zustand)                │
├─────────────────────────────────────┤
│  Service Layer                      │  ビジネスロジック
│  - services/                        │
├─────────────────────────────────────┤
│  Data Access Layer                  │  API通信・認証
│  - lib/supabase.ts                  │
│  - TanStack Query                   │
└─────────────────────────────────────┘
```

## レビュー観点

### 1. 責務の分離（Separation of Concerns）

#### ✅ Good Examples

**Server Component**: データフェッチとレンダリング
```typescript
// app/users/[id]/page.tsx (Server Component)
export default async function UserPage({ params }: { params: { id: string } }) {
  // Server Componentでデータフェッチ
  const user = await getUserById(params.id);

  return <UserProfile user={user} />;
}
```

**Client Component**: ユーザー操作とインタラクション
```typescript
// components/UserProfile.tsx
'use client'

export function UserProfile({ user }: { user: User }) {
  const handleEdit = () => {
    // ユーザー操作のハンドリング
  };

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={handleEdit}>編集</button>
    </div>
  );
}
```

**hooks/**: ステートとロジックのカプセル化
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    if (error) throw error;
  };

  return { user, loading, signInWithGoogle };
}
```

**lib/**: ユーティリティとクライアント
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

#### ❌ Bad Examples

**Client Componentで不要にデータフェッチ**
```typescript
// ❌ Bad: Client Componentで直接データフェッチ
'use client'
export default function UserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);

  // ❌ useEffectでデータフェッチ（Server Componentを使うべき）
  useEffect(() => {
    fetchUser(params.id).then(setUser);
  }, [params.id]);

  if (!user) return <div>Loading...</div>;

  return <div>{user.name}</div>;
}
```

**hooks/にビジネスロジックが混在**
```typescript
// ❌ Bad: hooksにビジネスロジックが混在
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = async (name: string) => {
    // ❌ バリデーション、データ変換、API呼び出しがhooksに混在
    if (!name || name.length < 3) {
      throw new Error('Name must be at least 3 characters');
    }

    const normalized = name.trim().toLowerCase();
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: normalized });

    if (error) throw error;
    setProjects([...projects, data]);
  };

  return { projects, addProject };
}
```

### 2. 依存関係の方向性

#### ルール
- 上位レイヤーは下位レイヤーに依存可能
- 下位レイヤーは上位レイヤーに依存してはいけない
- Client Componentは必要最小限に

#### 依存の方向（LinkLoom）
```
app/ → components/ → hooks/ → services/ → lib/
  ↓         ↓          ↓          ↓         ↓
(Pages) (UI/Logic) (State)  (Business)  (Data Access)
```

#### ✅ Good: 正しい依存方向
```typescript
// app/ → components/
import { UserProfile } from '@/components/UserProfile';

// components/ → hooks/
import { useAuth } from '@/hooks/useAuth';

// hooks/ → lib/
import { supabase } from '@/lib/supabase';

// services/ → lib/
import { supabase } from '@/lib/supabase';
```

#### ❌ Bad: 逆依存
```typescript
// ❌ lib/がhooks/に依存
import { useAuth } from '@/hooks/useAuth';  // libはhooksに依存してはいけない

// ❌ hooks/がcomponents/に依存
import { Button } from '@/components/ui/Button';  // hooksはUIに依存してはいけない
```

### 3. Server Component / Client Componentの適切な使い分け

#### ✅ Good: Server Componentを優先
```typescript
// ✅ Server Componentでデータフェッチ（デフォルト）
export default async function ProjectsPage() {
  const projects = await getProjects();  // サーバーサイドで実行

  return <ProjectList projects={projects} />;
}
```

#### ❌ Bad: 不要なClient Component
```typescript
// ❌ Bad: 'use client'が不要
'use client'  // インタラクションがないのにClient Component
export default function ProjectsPage() {
  const projects = useProjects();  // データフェッチはServer Componentで

  return <div>{projects.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}
```

### 4. 共通処理の抽出（DRY原則）

#### ✅ Good: 共通処理をlib/に抽出
```typescript
// lib/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// hooks/useAuth.tsで使用
import { validateEmail } from '@/lib/validation';
```

#### ❌ Bad: 同じコードの重複
```typescript
// hooks/useAuth.ts
export const validateEmail = (email: string): boolean => { ... };

// components/SignupForm.tsx
const validateEmail = (email: string): boolean => { ... };
// ❌ 重複コード
```

### 5. 循環依存の回避

#### ❌ Bad: 循環依存
```typescript
// hooks/useUser.ts
import { useProjects } from './useProjects';

export function useUser(userId: string) {
  const { projects } = useProjects(userId);
  // ...
}

// hooks/useProjects.ts
import { useUser } from './useUser';  // ❌ 循環依存

export function useProjects(userId: string) {
  const { user } = useUser(userId);
  // ...
}
```

#### ✅ Good: 循環依存の解消
```typescript
// hooks/useUser.ts
export function useUser(userId: string) {
  // Supabaseから直接フェッチ
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => supabase.from('users').select('*').eq('id', userId).single()
  });
  return { user };
}

// hooks/useProjects.ts
export function useProjects(userId: string) {
  // Supabaseから直接フェッチ
  const { data: projects } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => supabase.from('projects').select('*').eq('user_id', userId)
  });
  return { projects };
}
```

## チェックリスト

### app/ (Pages)
- [ ] Server Componentが優先されているか
- [ ] データフェッチがServer Componentで実行されているか
- [ ] Client Componentが必要最小限か
- [ ] 'use client'ディレクティブが適切に使われているか

### components/ (UI)
- [ ] コンポーネントが適切な粒度に分割されているか
- [ ] 再利用可能なコンポーネントがui/に配置されているか
- [ ] プレゼンテーショナルコンポーネントとコンテナコンポーネントが分離されているか
- [ ] propsの型定義が明確か

### hooks/ (Logic)
- [ ] カスタムフックが適切に抽出されているか
- [ ] ビジネスロジックがservices/に委譲されているか
- [ ] useEffectの依存配列が適切か
- [ ] フックの責務が明確か

### lib/ (Utilities)
- [ ] ユーティリティ関数が適切に抽出されているか
- [ ] Supabaseクライアントが適切に設定されているか
- [ ] 環境変数が適切に使われているか
- [ ] 型定義が明確か

### 共通処理
- [ ] 重複コードがlib/に抽出されているか
- [ ] 循環依存が発生していないか
- [ ] 依存関係の方向が適切か

### ディレクトリ構造
- [ ] ファイルが適切なディレクトリに配置されているか
- [ ] 命名規則が一貫しているか
- [ ] Next.js App Routerの規約に従っているか
