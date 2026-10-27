---
name: feature-structure
description: Enforce Tagiva feature architecture (src/features/ + src/app/ split, Server Actions, Supabase queries, hooks, shadcn/ui, design tokens) when building a NEW feature OR enhancing an EXISTING one. Use for "create a feature", "add a page", "scaffold a module", AND for "extend this feature", "refactor this page", or any edit to files under src/features/ or src/app/.
---

# Feature Structure (`src/features/` + `src/app/`)

Single source of truth for how feature code is shaped in Tagiva (modeled after `rabbit-customer-web`).

## Directory Layout

Every feature lives in `src/features/<feature>/` (or `src/features/<parent>/<sub-feature>/` for nested routes like `/invoices/new`, `/invoices/[id]`, `/settings/billing`):

```text
src/features/<feature>/
├── index.ts               # barrel — re-exports <Feature>Page, <feature>Metadata, public actions/components
├── page.tsx               # page-level Server Component: layout + data orchestration only
├── metadata.ts            # Next.js Metadata / generateMetadata
├── actions.ts             # Next.js Server Actions ('use server') returning ActionResult<T>
├── components/            # UI components private to this feature (client leaf components live here)
├── hooks/                 # client composition hooks: local/derived state + action/query wiring
│   └── use-<feature>.ts   # kebab-case filename, camelCase export
├── queries/               # server/client data fetching functions
│   └── <feature>-queries.ts
├── config/                # static per-feature config (status maps, tabs, step definitions)
├── types/
│   └── index.ts           # feature-scoped TypeScript interfaces
└── __tests__/             # feature unit & integration tests
```

## Routing Entry (`src/app/`) — Re-Export Only

`src/app/` contains **zero** feature UI, hooks, queries, or business logic. Every route `page.tsx` only re-exports from `src/features/<feature>`:

```tsx
// src/app/(app)/<route>/page.tsx
import { <Feature>Page, <feature>Metadata } from '@/features/<feature>';

export const metadata = <feature>Metadata;

export default <Feature>Page;
```

## Hard Rules

1. **No UI/logic in `src/app/`:** Route `page.tsx` files only re-export from `src/features/<feature>`.
2. **All filenames are `kebab-case`** (`use-invoice-builder.ts`, `invoice-queries.ts`, `invoice-action-bar.tsx`); exports use `camelCase` / `PascalCase`.
3. **Sub-features nest one level** when a route is a child of another route (`invoices/new/`, `invoices/detail/`, `settings/billing/`) and share the parent feature's `actions.ts`, `queries/`, `hooks/`, and `components/`.
4. **Shared `src/components/`** is reserved only for cross-feature UI:
   - `src/components/ui/` — shadcn/ui primitives
   - `src/components/layout/` — shared app shells (`TagivaLogo`, `AppSidebar`, `AppHeader`, `FreeSlotCounter`, `SubscriptionBanners`)
   - `src/components/invoice-templates/` — shared invoice templates (`modern-minimalist/web-preview.tsx` & `pdf-document.tsx`)
5. **Server Components by default:** Keep `src/features/<feature>/page.tsx` as a Server Component and push `'use client'` down to the interactive leaf components in `src/features/<feature>/components/`.
6. **Domain rules stay in `src/lib/domain/`:** Financial calculations (`calculations.ts`), timezone helpers (`timezone.ts`), numbering (`numbering.ts`), status resolution (`status.ts`), and plan entitlements (`entitlements.ts`) remain in `src/lib/domain/`.
