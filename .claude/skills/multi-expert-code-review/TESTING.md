# Testing Review Guidelines

## LinkLoomプロジェクトのテストパターン

**重要**: このファイルは`tests/README.md`の内容を補完します。詳細なガイドラインは`tests/README.md`を参照してください。

### テストファイル構造

```
tests/
├── unit/                  # ユニットテスト（Vitest）
│   ├── components/        # コンポーネントテスト
│   ├── hooks/             # カスタムフックテスト
│   └── lib/               # ユーティリティテスト
├── e2e/                   # E2Eテスト（Playwright）
│   ├── auth.spec.ts       # 認証フロー
│   └── projects.spec.ts   # プロジェクト管理
└── mocks/                 # モックデータ
    ├── supabase.ts        # Supabaseモック
    └── handlers.ts        # MSWハンドラ（将来）
```

### テストフレームワーク

- **Vitest**: ユニットテストランナー（高速、TypeScript対応）
- **Playwright**: E2Eテスト（クロスブラウザ対応）
- **React Testing Library (RTL)**: Reactコンポーネントテスト

## レビュー観点

### 1. エッジケーステスト（it.each推奨）

#### ✅ Good: Vitestのit.each（代表ケース主義）

```typescript
import { describe, it, expect } from 'vitest'

describe('formatFullName', () => {
  test.each([
    {
      firstName: '太郎',
      lastName: '佐藤',
      expected: '佐藤 太郎',
      description: '姓名を空白スペースで分けて返す',
    },
    {
      firstName: '太郎',
      lastName: undefined,
      expected: '太郎',
      description: '名字がundefinedの場合は名前だけを返す',
    },
    {
      firstName: undefined,
      lastName: '佐藤',
      expected: '佐藤',
      description: '名前がundefinedの場合は名字だけを返す',
    },
    {
      firstName: undefined,
      lastName: undefined,
      expected: '',
      description: '名字と名前がundefinedの場合は空白を返す',
    },
  ])('$description', ({ firstName, lastName, expected }) => {
    const result = formatFullName({ firstName, lastName })
    expect(result).toBe(expected)
  })
})
```

**メリット:**

- エッジケース（null, undefined, 空文字列等）が網羅的にテストできる
- 新しいケースの追加が容易
- テストの意図が明確
- tests/README.mdの「代表ケース主義」に準拠

### 2. AAA（Arrange-Act-Assert）パターン

#### ✅ Good: AAAパターン

```typescript
test('should create a new user', async () => {
  // Arrange: テストデータの準備
  const input = {
    email: 'test@example.com',
    name: 'Test User',
  }

  // Act: テスト対象の実行
  const result = await createUser(input)

  // Assert: 結果の検証
  expect(result.email).toBe(input.email)
  expect(result.name).toBe(input.name)
  expect(result.id).toBeDefined()
})
```

### 3. モック戦略（vi.spyOn / vi.mock の使い分け）

**重要**: `tests/README.md`の「モック戦略」セクションも参照してください。

#### ✅ Good: Vitestのvi.spyOn（監視）とvi.mock（置換）

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'sonner'

// ✅ vi.mock: 外部依存を置換
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks() // 各テスト前にモックをリセット
  })

  test('エラー時にtoast.errorが呼ばれる', async () => {
    // Given: エラーをモック
    const mockSignIn = vi.fn().mockRejectedValue(new Error('Auth failed'))

    // When: サインイン実行
    await expect(mockSignIn()).rejects.toThrow('Auth failed')

    // Then: エラートーストが表示される
    expect(toast.error).toHaveBeenCalled()
  })
})
```

#### ❌ Bad: 実際のSupabaseに依存

```typescript
// ❌ 実際のSupabaseを使用（テストが遅く、不安定）
test('ログインできる', async () => {
  // 実際のSupabaseに接続
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })

  expect(error).toBeNull()
})
```

### 4. エッジケースのカバー（代表値主義）

**重要**: tests/README.mdに記載の通り、**全パターン羅列ではなく代表ケースのみ**をテストします。

#### ✅ Good: 代表的なエッジケースをテスト

```typescript
import { describe, it, expect } from 'vitest'

describe('divide', () => {
  test.each([
    { a: 10, b: 2, expected: 5, description: '正常ケース' },
    { a: 10, b: 0, expected: null, description: 'ゼロ除算' },
    { a: 0, b: 5, expected: 0, description: 'ゼロ' },
    { a: -10, b: 2, expected: -5, description: '負の数' },
  ])('$description: $a / $b = $expected', ({ a, b, expected }) => {
    const result = divide(a, b)
    if (expected === null) {
      expect(result).toBeNull()
    } else {
      expect(result).toBeCloseTo(expected, 3)
    }
  })
})
```

**重要なエッジケース（tests/README.md参照）:**

- `null`, `undefined`（最重要）
- 空文字列 `''`
- 空配列 `[]`, 空オブジェクト `{}`
- ゼロ `0`
- 負の数
- 境界値（最小値、最大値）

**注意**: 全パターンを網羅する必要はなく、ユーザー影響が変わる代表値のみテストします。

### 5. テストの独立性（Vitest + Playwright推奨）

**重要**: tests/README.mdに記載の通り、**各テストは独立して実行可能**である必要があります。

#### ✅ Good: Vitestでテストが独立

```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest'

describe('useAuth', () => {
  let mockUser: User

  beforeEach(() => {
    // 各テストで初期化
    mockUser = { id: '1', name: 'Test' }
    vi.clearAllMocks() // Vitestのモッククリア
  })

  test('ユーザー情報を取得できる', () => {
    // test 1は独立
    expect(mockUser.id).toBe('1')
  })

  test('ユーザー情報が更新される', () => {
    // test 2もtest 1に依存しない
    mockUser.name = 'Updated'
    expect(mockUser.name).toBe('Updated')
  })
})
```

#### ❌ Bad: テストが依存（アンチパターン）

```typescript
// ❌ テストが前のテストに依存
let user: User

test('ユーザーを作成できる', async () => {
  user = await createUser({ name: 'Test' })
  expect(user.id).toBeDefined()
})

test('ユーザーを更新できる', async () => {
  // ❌ 前のテストの結果に依存（実行順序に依存）
  const updated = await updateUser(user.id, { name: 'Updated' })
  expect(updated.name).toBe('Updated')
})
```

#### ✅ Good: Playwrightでテストが独立

```typescript
import { test, expect } from '@playwright/test'

test.describe('認証フロー', () => {
  // ✅ 各テストが独立したコンテキストで実行
  test('ログインボタンが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /ログイン/i })).toBeVisible()
  })

  test('ログアウトボタンが表示される', async ({ page }) => {
    // ✅ 新しいコンテキストで実行（前のテストに影響されない）
    await page.goto('/dashboard')
    await expect(page.getByRole('button', { name: /ログアウト/i })).toBeVisible()
  })
})
```

### 6. テストの命名規則

#### ✅ Good: 明確な命名

```typescript
// 日本語のdescriptionで意図を明確に
describe('ユーザー登録', () => {
  test('有効なメールアドレスでユーザーを作成できる', () => {})
  test('無効なメールアドレスの場合はエラーを返す', () => {})
  test('重複したメールアドレスの場合はエラーを返す', () => {})
})
```

### 7. エラーケースのテスト（重要）

**重要**: tests/README.mdに記載の通り、**エラーケースも主要フローの一部**としてテストします。

#### ✅ Good: Vitestでエラーケースをテスト

```typescript
import { describe, it, expect, vi } from 'vitest'

it('認証エラー時に適切なエラーメッセージが表示される', async () => {
  // Given: エラーをモック
  const mockSignIn = vi.fn().mockRejectedValue(new Error('Auth failed'))

  // When/Then: エラーが投げられる
  await expect(mockSignIn()).rejects.toThrow('Auth failed')
})

it('無効なメールアドレスでバリデーションエラーが発生する', () => {
  // When/Then: バリデーションエラー
  expect(() => validateEmail('invalid')).toThrow('Invalid email format')
})
```

## テストアンチパターン（tests/README.md参照）

### 避けるべきパターン

```typescript
// ❌ 複数のことをテストしすぎ（1テスト1関心）
it('すべてのユーザー操作が動作する', async () => {
  // ユーザー作成
  const user = await createUser({ name: 'Test' })
  // ユーザー更新
  const updated = await updateUser(user.id, { name: 'Updated' })
  // ユーザー削除
  await deleteUser(user.id)
  // 検証が複雑（何が失敗したか分からない）
})

// ❌ テストの説明が不明確
it('works', () => {})
it('test 1', () => {})

// ❌ 実装の詳細をテスト（tests/README.md: 「実装詳細を避ける」）
it('内部メソッドが呼ばれる', () => {
  const spy = vi.spyOn(service, '_privateMethod')
  service.publicMethod()
  expect(spy).toHaveBeenCalled() // ❌ 実装に依存しすぎ
})

// ❌ Playwrightでハードウェイト（tests/README.md参照）
test('ボタンクリック後に表示される', async ({ page }) => {
  await page.click('button')
  await page.waitForTimeout(3000) // ❌ ハードウェイト禁止
  await expect(page.getByText('Success')).toBeVisible()
})

// ✅ Playwrightのオートウェイト活用
test('ボタンクリック後に表示される', async ({ page }) => {
  await page.click('button')
  // ✅ waitForがオートウェイト
  await expect(page.getByText('Success')).toBeVisible()
})

// ❌ マジックナンバー
expect(result.length).toBe(3) // なぜ3なのか不明
```

## チェックリスト（tests/README.md準拠）

### テストの網羅性（代表ケース主義）

- [ ] 主要なユーザーフロー（認証、CRUD）がテストされているか
- [ ] エッジケース（null, undefined, 空文字列）の代表値がテストされているか
- [ ] エラーケース（ネットワークエラー、認証エラー）がテストされているか
- [ ] 全パターン羅列ではなく、代表値のみテストしているか

### テストの品質（tests/README.md: 「良いUT」の条件）

- [ ] テストの説明が日本語で振る舞いを表現しているか
- [ ] AAAパターン（Arrange-Act-Assert）に従っているか
- [ ] 1テスト1関心の原則が守られているか
- [ ] テストが独立しているか（state汚染なし）
- [ ] 実装詳細（内部state、呼び出し回数）に依存していないか

### モック戦略（vi.spyOn / vi.mock）

- [ ] vi.spyOn（監視）とvi.mock（置換）が適切に使い分けられているか
- [ ] モックがbeforeEachで正しくクリーンアップされているか（vi.clearAllMocks）
- [ ] 不要なモックがないか（疎モック原則）
- [ ] 外部依存（Supabase、router、toast等）のみモック化しているか

### RTL（React Testing Library）

- [ ] getByRole/findByTextなどアクセシビリティファーストのクエリを使用しているか
- [ ] `waitFor`/`findBy`で非同期処理を適切に待機しているか
- [ ] 手動sleep（setTimeout）を使っていないか

### Playwright（E2E）

- [ ] ロケータ（getByRole/getByLabel/getByTestId）を使用しているか
- [ ] ハードウェイト（waitForTimeout）を使っていないか
- [ ] オートウェイトを活用しているか
- [ ] テストが独立しているか（各テストが新規コンテキスト）

### パフォーマンス

- [ ] テストが速いか（実際のSupabase/ネットワークを使っていないか）
- [ ] 不要な非同期処理がないか
- [ ] テストのセットアップが最小限か

### メンテナンス性

- [ ] テストが理解しやすいか（日本語テスト名）
- [ ] リファクタ耐性があるか（実装詳細に依存していないか）
- [ ] ヘルパー関数が適切に抽出されているか
