# TypeScript / Modern JavaScript Review Guidelines

## TypeScriptレビューの重要観点

### 1. 型安全性

#### ✅ Good: 適切な型定義
```typescript
// ✅ 明示的な型定義
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;  // Optional
}

const getUser = (id: string): Promise<User> => {
  return fetch(`/api/users/${id}`).then(res => res.json());
};

// ✅ Union Types
type Status = 'pending' | 'active' | 'inactive';

// ✅ Generics
const fetchData = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  return response.json() as T;
};
```

#### ❌ Bad: any型の乱用
```typescript
// ❌ any型を使いすぎ
const processData = (data: any): any => {
  return data.map((item: any) => item.value);
};

// ❌ 型定義なし
const getUser = (id) => {
  return fetch(`/api/users/${id}`).then(res => res.json());
};
```

### 2. Optional Chaining & Nullish Coalescing

#### ✅ Good: モダンな演算子を活用
```typescript
// ✅ Optional Chaining
const userName = user?.profile?.name;

// ✅ Nullish Coalescing
const displayName = user?.name ?? 'Unknown';

// ✅ 組み合わせ
const age = user?.profile?.age ?? 0;
```

#### ❌ Bad: 古い書き方
```typescript
// ❌ 冗長なnullチェック
const userName = user && user.profile && user.profile.name;

// ❌ ||演算子（falsyな値も置き換えてしまう）
const displayName = user.name || 'Unknown';  // ''も'Unknown'になる
```

### 3. 非同期処理（async/await）

#### ✅ Good: async/await
```typescript
// ✅ async/await
const fetchUserData = async (userId: string): Promise<UserData> => {
  try {
    const user = await fetchUser(userId);
    const projects = await fetchProjects(userId);
    return { user, projects };
  } catch (error) {
    logger.error('Failed to fetch user data', error);
    throw error;
  }
};

// ✅ 並列実行
const fetchAllData = async (): Promise<AllData> => {
  const [users, projects, tasks] = await Promise.all([
    fetchUsers(),
    fetchProjects(),
    fetchTasks()
  ]);
  return { users, projects, tasks };
};
```

#### ❌ Bad: Promise.then()チェーン
```typescript
// ❌ then()チェーン（可読性が低い）
const fetchUserData = (userId: string): Promise<UserData> => {
  return fetchUser(userId)
    .then(user => {
      return fetchProjects(userId).then(projects => {
        return { user, projects };
      });
    })
    .catch(error => {
      logger.error('Failed to fetch user data', error);
      throw error;
    });
};
```

### 4. 分割代入（Destructuring）

#### ✅ Good: 分割代入を活用
```typescript
// ✅ オブジェクトの分割代入
const { id, name, email } = user;

// ✅ 配列の分割代入
const [first, second, ...rest] = items;

// ✅ 関数の引数で分割代入
const createUser = ({ name, email }: CreateUserInput): User => {
  // ...
};

// ✅ ネストした分割代入
const { profile: { name, age } } = user;
```

#### ❌ Bad: 冗長なアクセス
```typescript
// ❌ 冗長
const id = user.id;
const name = user.name;
const email = user.email;

// ❌ 繰り返しアクセス
if (user.profile.name && user.profile.age > 18) {
  console.log(user.profile.name);
}
```

### 5. アロー関数

#### ✅ Good: アロー関数を適切に使用
```typescript
// ✅ 簡潔なアロー関数
const double = (n: number): number => n * 2;

// ✅ 配列メソッドでの使用
const names = users.map(user => user.name);
const adults = users.filter(user => user.age >= 18);

// ✅ コールバック
setTimeout(() => {
  console.log('Timeout!');
}, 1000);
```

#### ❌ Bad: 古い関数宣言
```typescript
// ❌ function式（アロー関数の方が簡潔）
const double = function(n: number): number {
  return n * 2;
};

// ❌ bindが必要
function MyComponent() {
  this.handleClick = function() {
    console.log(this);  // thisのバインドが必要
  }.bind(this);
}
```

### 6. const/let（varは使わない）

#### ✅ Good: const/letを使用
```typescript
// ✅ 再代入しない変数はconst
const MAX_USERS = 100;
const user = { name: 'Test' };

// ✅ 再代入する変数のみlet
let count = 0;
for (let i = 0; i < 10; i++) {
  count += i;
}
```

#### ❌ Bad: varを使用
```typescript
// ❌ varは使わない
var name = 'Test';  // スコープの問題がある
```

### 7. テンプレートリテラル

#### ✅ Good: テンプレートリテラル
```typescript
// ✅ テンプレートリテラル
const greeting = `Hello, ${user.name}!`;

// ✅ 複数行文字列
const html = `
  <div>
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`;
```

#### ❌ Bad: 文字列結合
```typescript
// ❌ 文字列結合（読みにくい）
const greeting = 'Hello, ' + user.name + '!';

// ❌ 複数行文字列
const html = '<div>\n' +
  '  <h1>' + title + '</h1>\n' +
  '  <p>' + content + '</p>\n' +
  '</div>';
```

### 8. 型ガード

#### ✅ Good: 型ガードを使用
```typescript
// ✅ 型ガード関数
const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

// ✅ typeof型ガード
const processValue = (value: string | number) => {
  if (typeof value === 'string') {
    return value.toUpperCase();  // string型として扱える
  }
  return value.toFixed(2);  // number型として扱える
};

// ✅ in演算子
const processAnimal = (animal: Dog | Cat) => {
  if ('bark' in animal) {
    animal.bark();  // Dog型
  } else {
    animal.meow();  // Cat型
  }
};
```

### 9. Enumの適切な使用

#### ✅ Good: Enumまたは Union Types
```typescript
// ✅ Union Types（推奨）
type UserRole = 'admin' | 'user' | 'guest';

// ✅ Enum（必要な場合）
enum Status {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}
```

#### ❌ Bad: マジックストリング
```typescript
// ❌ マジックストリング
if (user.role === 'admin') {  // タイポの危険性
  // ...
}
```

### 10. 型アサーション（as）の最小化

#### ✅ Good: 型推論を活用
```typescript
// ✅ 型推論
const user = {
  id: '1',
  name: 'Test'
};  // User型として推論される

// ✅ 型ガードで型を絞り込む
if (typeof value === 'string') {
  value.toUpperCase();  // 型アサーション不要
}
```

#### ❌ Bad: 型アサーションの乱用
```typescript
// ❌ 型アサーションを多用
const data = response.data as any as User;

// ❌ 不必要な型アサーション
const name = (user.name as string).toUpperCase();
```

## TypeScriptアンチパターン

### 避けるべきパターン

```typescript
// ❌ any型の乱用
const process = (data: any): any => { };

// ❌ @ts-ignoreの乱用
// @ts-ignore
const result = dangerousOperation();

// ❌ 型定義の省略
const fetchData = (url) => {  // 引数と戻り値の型がない
  return fetch(url).then(res => res.json());
};

// ❌ 過度な型アサーション
const user = data as User as AdminUser;

// ❌ 型定義の重複
interface User {
  id: string;
  name: string;
}
interface UserData {  // Userと同じ定義
  id: string;
  name: string;
}
```

## チェックリスト

### 型定義
- [ ] any型の使用が最小限か
- [ ] 関数の引数と戻り値に型定義があるか
- [ ] インターフェースや型エイリアスが適切に使われているか
- [ ] Union Typesが適切に使われているか

### モダンJavaScript
- [ ] const/letが使われているか（varは避ける）
- [ ] アロー関数が使われているか
- [ ] Optional Chaining (`?.`)が活用されているか
- [ ] Nullish Coalescing (`??`)が活用されているか
- [ ] テンプレートリテラルが使われているか
- [ ] 分割代入が活用されているか

### 非同期処理
- [ ] async/awaitが使われているか（then()チェーンは避ける）
- [ ] 並列実行可能な処理がPromise.allで実行されているか
- [ ] エラーハンドリングが適切か（try/catch）

### 型安全性
- [ ] 型ガードが適切に使われているか
- [ ] 型アサーション（as）が最小限か
- [ ] strictNullChecksに準拠しているか
- [ ] @ts-ignoreが乱用されていないか

### コードの簡潔性
- [ ] 不要な冗長なコードがないか
- [ ] モダンな構文が活用されているか
- [ ] 可読性が高いか

### ESLintルール
- [ ] ESLintのルールに準拠しているか
- [ ] 未使用の変数・インポートがないか
- [ ] コンソールログが残っていないか（本番コード）
