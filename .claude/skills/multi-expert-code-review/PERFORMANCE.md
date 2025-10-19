# Performance Review Guidelines

## LinkLoomプロジェクトのパフォーマンスレビュー観点

**技術スタック固有の最適化:**
- React Query (TanStack Query) のキャッシュ活用
- Next.js 15 App Router (Server Component優先)
- Supabaseのクエリ最適化

## パフォーマンスレビューの重要観点

### 1. N+1クエリ問題（Supabase）

#### ❌ Bad: N+1クエリ
```typescript
// ❌ ループ内でSupabase呼び出し（N+1問題）
const { data: users } = await supabase.from('users').select('*');
for (const user of users) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  user.profile = profile;
}
```

#### ✅ Good: Supabaseのリレーション取得
```typescript
// ✅ Supabaseの自動JOIN（1クエリで解決）
const { data: users } = await supabase
  .from('users')
  .select(`
    *,
    profiles (*)
  `);

// ✅ 複数リレーションも1クエリ
const { data: projects } = await supabase
  .from('projects')
  .select(`
    *,
    users (*),
    tasks (*)
  `);
```

**重要**: Supabaseの`select()`内でリレーションを指定すれば、自動的にJOINされN+1問題を回避できます。

### 2. 非同期処理の並列化

#### ❌ Bad: 逐次実行
```typescript
// ❌ 逐次実行（遅い）
const user = await fetchUser(userId);
const projects = await fetchProjects(userId);
const notifications = await fetchNotifications(userId);
// 合計: T1 + T2 + T3
```

#### ✅ Good: 並列実行
```typescript
// ✅ 並列実行（速い）
const [user, projects, notifications] = await Promise.all([
  fetchUser(userId),
  fetchProjects(userId),
  fetchNotifications(userId)
]);
// 合計: max(T1, T2, T3)
```

### 3. 大量データの処理

#### ❌ Bad: 全データをメモリに読み込み
```typescript
// ❌ 全データを一度に取得
const allUsers = await User.find();  // 数万件
const results = allUsers.map(user => process(user));
// メモリ不足の危険性
```

#### ✅ Good: ページネーション or ストリーム処理
```typescript
// ✅ ページネーションで分割処理
const pageSize = 100;
let page = 0;
let hasMore = true;

while (hasMore) {
  const users = await User.find({
    skip: page * pageSize,
    take: pageSize
  });

  for (const user of users) {
    await process(user);
  }

  hasMore = users.length === pageSize;
  page++;
}

// ✅ ストリーム処理
const stream = getRepository(User)
  .createQueryBuilder('user')
  .stream();

for await (const user of stream) {
  await process(user);
}
```

### 4. 不要な計算の削減

#### ❌ Bad: ループ内で繰り返し計算
```typescript
// ❌ ループ内で同じ計算を繰り返す
for (const item of items) {
  const threshold = calculateThreshold();  // ❌ 毎回計算
  if (item.value > threshold) {
    // ...
  }
}
```

#### ✅ Good: 事前計算 or メモ化
```typescript
// ✅ 事前に計算
const threshold = calculateThreshold();
for (const item of items) {
  if (item.value > threshold) {
    // ...
  }
}

// ✅ メモ化
const memoizedCalculate = memoize(calculateExpensiveValue);
```

### 5. インデックスの活用

#### ❌ Bad: インデックスなしのクエリ
```typescript
// ❌ インデックスがないカラムでフィルタ
const users = await User.find({
  where: { nickname: 'john' }  // nicknameにインデックスなし
});
```

#### ✅ Good: インデックス付きカラムでクエリ
```typescript
// ✅ インデックス付きカラムで検索
const users = await User.find({
  where: { email: 'john@example.com' }  // emailにインデックスあり
});

// マイグレーションでインデックス作成
await queryRunner.createIndex('users', new TableIndex({
  name: 'IDX_users_email',
  columnNames: ['email']
}));
```

### 6. キャッシュの活用

#### ✅ Good: 頻繁にアクセスされるデータをキャッシュ
```typescript
import { Redis } from 'ioredis';

const redis = new Redis();

// キャッシュから取得
const getCachedUser = async (userId: string): Promise<User> => {
  const cached = await redis.get(`user:${userId}`);

  if (cached) {
    return JSON.parse(cached);
  }

  // キャッシュになければDBから取得
  const user = await User.findOne({ where: { id: userId } });

  if (user) {
    // キャッシュに保存（TTL: 1時間）
    await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
  }

  return user;
};
```

### 7. React Queryのキャッシュ活用

#### ✅ Good: React Queryで適切にキャッシュ
```typescript
// ✅ React QueryのstaleTime/cacheTimeを設定
import { useQuery } from '@tanstack/react-query'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,  // 5分間はキャッシュを使用
    cacheTime: 10 * 60 * 1000,  // 10分間キャッシュを保持
  });
}
```

#### ❌ Bad: 毎回再フェッチ
```typescript
// ❌ React Queryを使わず毎回フェッチ
export function useProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // 毎回フェッチ（キャッシュなし）
    supabase.from('projects').select('*').then(({ data }) => setProjects(data));
  }, []);

  return projects;
}
```

### 8. Server Component vs Client Component

#### ✅ Good: Server Componentを優先
```typescript
// ✅ Server Componentでデータフェッチ（高速）
export default async function ProjectsPage() {
  const { data: projects } = await supabase.from('projects').select('*');

  return <ProjectList projects={projects} />;
}
```

#### ❌ Bad: 不要なClient Component
```typescript
// ❌ Client Componentで不要にuseEffect
'use client'
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    supabase.from('projects').select('*').then(({ data }) => setProjects(data));
  }, []);

  return <ProjectList projects={projects} />;
}
```

### 9. タイムアウト設定

#### ✅ Good: タイムアウトを設定
```typescript
// ✅ タイムアウト設定
const fetchWithTimeout = async (url: string, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
```

## パフォーマンスアンチパターン

### 避けるべきパターン

```typescript
// ❌ ループ内でのawait（N+1問題）
for (const id of ids) {
  await processItem(id);
}

// ❌ 不要なデータの取得
const users = await User.find();  // 全カラム取得
// 必要なのはidとnameだけなのに

// ❌ 同期処理でブロック
const data = fs.readFileSync('large-file.txt');  // ブロッキング

// ❌ 巨大なJSON応答
res.json(hugeArray);  // 数万件のデータ
```

## チェックリスト（LinkLoom固有）

### Supabaseクエリ最適化
- [ ] N+1クエリが発生していないか（リレーションを1クエリで取得）
- [ ] 不要なカラムを取得していないか（`select('*')`の乱用）
- [ ] ページネーション（limit/offset）が適切に使われているか
- [ ] インデックスが適切に設定されているか

### React Query（TanStack Query）
- [ ] React Queryのキャッシュが適切に設定されているか（staleTime/cacheTime）
- [ ] queryKeyが適切に設定されているか
- [ ] 不要な再フェッチが発生していないか
- [ ] useQueryの代わりにuseEffectを使っていないか

### Next.js 15 App Router
- [ ] Server Componentが優先されているか
- [ ] 不要な'use client'がないか
- [ ] Client Componentで不要にuseEffectを使っていないか
- [ ] データフェッチがServer Componentで実行されているか

### 非同期処理
- [ ] 並列化できる処理が逐次実行されていないか
- [ ] 不要な`await`が並列化を妨げていないか
- [ ] Promise.allが適切に使われているか

### メモリ管理
- [ ] 大量データを一度にメモリに読み込んでいないか
- [ ] ページネーションが使われているか
- [ ] メモリリークの可能性がないか

### 計算効率
- [ ] 不要な計算が繰り返されていないか
- [ ] useMemo/useCallbackが適切に使われているか
- [ ] ループ内の計算が最適化されているか

### その他
- [ ] 同期処理（ブロッキング）を使っていないか
- [ ] 大量データの応答が適切に分割されているか
- [ ] 不要なネットワーク呼び出しがないか
