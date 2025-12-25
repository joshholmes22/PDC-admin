# Copilot Project Instructions – Palace Drum Clinic Admin Portal

## Project Overview

This codebase powers the Palace Drum Clinic admin portal for the mobile app, built in React + Vite, using Supabase as the backend (Auth, Database, Storage, Edge Functions).

The app includes:

- **Video content**: professional drummer lessons, video series, video tracking
- **Bookings**: drum-zone booking calendar (future)
- **Practice logging**: logs linked to videos + user profiles
- **User profiles**: onboarding, progress systems, saved content
- **Admin flows** (IN THIS APP): content upload, notifications, analytics view

The aim: clean, scalable, production-ready code, written in a way that makes future scaling trivial and keeps security airtight.

---

## Tech Stack Requirements

### Frontend

- React 19.x with Vite 7.x
- TypeScript 5.9+ (strict mode)
- Zustand for all app state
- Zod v4 for validation
- React Hook Form with @hookform/resolvers/zod
- Shadcn-style UI components (in /components/ui)
- Recharts for analytics visualization
- TanStack Table for data tables
- React Router DOM for routing
- Lucide React for icons

### Backend

- Supabase (auth, RLS-enabled DB, storage, edge functions)
- No ad-hoc REST APIs unless wrapped in Supabase Edge Functions

### Architecture

- Atomic components
- Clear folder structure following existing patterns
- Reusability first
- Security first (avoid leaking keys, avoid insecure client logic, lean on RLS and Supabase policies)

---

## Critical Technical Patterns (MUST FOLLOW)

### 1. Zod v4 Compatibility

- `z.record()` REQUIRES two arguments: `z.record(z.string(), z.unknown())`
- The old syntax `z.record(z.unknown())` is INVALID in Zod v4
- Example: `metadataSchema = z.record(z.string(), z.unknown())`

### 2. Supabase Type Inference Workaround

When using `createClient<Database>()`, TypeScript cannot properly infer types for insert/update operations. All `.insert()` and `.update()` calls return 'never' type without explicit casting.

**SOLUTION**: Cast inputs and outputs explicitly:

```typescript
// Insert example
const { data, error } = await supabase
  .from("table_name")
  .insert(input as never) // Cast input as never
  .select()
  .single();
set({ items: [...get().items, data as MyType] }); // Cast result
return { success: true, data: data as MyType };

// Update example
const { data, error } = await supabase
  .from("table_name")
  .update(input as never)
  .eq("id", id)
  .select()
  .single();
set({ items: items.map((i) => (i.id === id ? (data as MyType) : i)) });
```

### 3. React Hook Form + Complex Types

Discriminated unions DON'T work well with react-hook-form defaults.

**SOLUTION**: Create a simplified FormValues interface, then build the complex type on submit:

```typescript
// Instead of using TargetAudience directly
interface FormValues {
  title: string;
  audience_type: 'all' | 'segment' | 'users';
  // Simple flat structure
}

// Build complex object on submit
const onSubmit = (values: FormValues) => {
  const targetAudience: TargetAudience =
    values.audience_type === 'all'
      ? { type: 'all' }
      : { type: values.audience_type, ... };
}
```

### 4. Recharts Label Functions

- Pie chart label render functions should NOT have explicit type annotations
- Let TypeScript infer from PieLabelRenderProps
- WRONG: `label={({ name, percent }: { name: string; percent?: number }) => ...}`
- RIGHT: `label={({ name, percent }) => ...}`

### 5. Zustand Persist Middleware

- The partialize function should not have unused parameters
- WRONG: `partialize: (state) => ({})`
- RIGHT: `partialize: () => ({})`

---

## General Coding Rules

Copilot MUST follow all these rules when generating code:

### 1. Use TypeScript, always

- Strict types
- Define types + interfaces in /types
- Never rely on `any`

### 2. Zustand for all shared state

- Stores live in /stores
- Persist only when needed
- Use selectors to avoid unnecessary re-renders

### 3. Supabase Integration

- All queries use the typed Supabase client with proper casts (see patterns above)
- Handle all errors explicitly
- Validate inputs/outputs with Zod
- Never expose secrets
- Respect RLS; don't assume admin privileges

### 4. Components

- Must be pure, small and composable
- Use hooks for logic (/hooks)
- No business logic inside UI components
- UI components in /components/ui follow Shadcn patterns

### 5. Navigation

- React Router DOM for all routing
- Keep navigation stacks simple and typed
- Use params interfaces
- No duplication of route paths

### 6. Reusability + Maintainability

- Extract reusable logic
- Generic hooks where appropriate
- Shared UI components in /components/ui

### 7. Security Requirements

- No inline secrets
- Environment variables via VITE\_ prefix in .env.local
- No storing sensitive data unencrypted
- Inspect all Supabase queries for potential leaks
- Never bypass RLS via the client
- Handle auth state race conditions
- Defensive coding everywhere
- Show configuration page if Supabase isn't configured (hasValidCredentials check)

### 8. Style + Standards

- ESLint config in eslint.config.js
- Meaningful variable/function names
- Avoid dead code
- Keep files small
- Comment when needed, not excessively
- Tailwind CSS for styling
- CSS variables for theming (in index.css)

---

## Project File Structure

```
src/
├── App.tsx                 # Main app with routes
├── main.tsx               # Entry point
├── index.css              # Global styles + CSS variables
├── components/
│   ├── ui/                # Reusable UI components (Button, Card, Input, etc.)
│   ├── layout/            # Layout components (DashboardLayout, Sidebar)
│   └── guards/            # Route guards (AdminGuard)
├── lib/
│   ├── supabase.ts        # Supabase client + hasValidCredentials
│   └── utils.ts           # Utility functions (cn, etc.)
├── pages/                 # Route pages
│   ├── index.ts           # Page exports
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── notifications/     # Notification pages
│   ├── content/           # Content management pages
│   ├── goals/             # Goal pages
│   └── bookings/          # Booking pages
├── stores/                # Zustand stores
│   ├── index.ts
│   ├── authStore.ts
│   ├── contentStore.ts
│   ├── notificationStore.ts
│   ├── usersStore.ts
│   ├── goalsStore.ts
│   └── bookingsStore.ts
└── types/
    ├── index.ts           # Type exports
    ├── database.ts        # Supabase database types
    └── schemas.ts         # Zod schemas for validation
```

---

## Feature Development Rules

Whenever Copilot generates code for a new screen, hook, store, or backend integration, it should:

1. Explain what it's building (in comments)
2. Follow existing folder structure
3. Create reusable helpers/services
4. Use Zod validation
5. Integrate with Zustand store where appropriate
6. Return typed results with proper casts
7. Handle loading, error, and empty states gracefully
8. Apply the Supabase type cast pattern for all insert/update operations

---

## Example Code Patterns

### Store (with proper type casts)

```typescript
// /stores/myFeatureStore.ts
createItem: async (input) => {
  const { data, error } = await supabase
    .from("my_table")
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  set({ items: [...get().items, data as MyType] });
  return { success: true, data: data as MyType };
};
```

### Schema (Zod v4 compatible)

```typescript
// /types/schemas.ts
export const mySchema = z.object({
  name: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()), // Always two args!
});
```

### Page Component

```typescript
// /pages/MyFeaturePage.tsx
export function MyFeaturePage() {
  const { items, isLoading, error, fetchItems } = useMyFeatureStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading) return <Spinner />;
  if (error) return <Alert variant="error">{error}</Alert>;

  return <DataTable data={items} columns={columns} />;
}
```

---

Anything Copilot writes should strengthen that long-term direction.
