# CODE_STYLE — TypeScript, Next.js, Tailwind & Domain Coding Standards

| Field | Value |
| :--- | :--- |
| Product name | **Tagiva** (`tagiva.com`, see `PRD.md` `D-59`) |
| Document status | **Approved** |
| Version | 1.0.0 |
| Last updated | 2026-10-27 |
| Depends on | `PRD.md` (v1.0.0), `DESIGN_SYSTEM.md` (v1.1.0), `ARCHITECTURE.md` (v1.1.0), `DATABASE.md` (v1.1.0), `API.md` (v1.0.0), `SECURITY.md` (v1.0.0) |

---

## 0. Purpose of this document

This document defines the **coding conventions**, **TypeScript strictness rules**, **file naming patterns**, **Next.js Server vs. Client component boundaries**, and **financial/timezone safety rules** for the codebase.

Its goals are:
1. Keep the codebase predictable, self-documenting, and free of implicit `any` types or floating-point money bugs (`NFR-4`).
2. Ensure human developers and AI agents write code that matches the architecture (`ARCHITECTURE.md`) and design system (`DESIGN_SYSTEM.md`).

How to read requirement keywords:
- **MUST**: enforced in code review and CI (`eslint` / `tsc --noEmit`).
- **SHOULD**: standard practice unless a documented exception applies.

---

## 1. Reused decisions from prior documents

| Decision ID | Summary | Code Style Rule |
| :--- | :--- | :--- |
| **D-02, D-37** | Next.js (App Router), Supabase, Tailwind CSS, shadcn/ui, Lucide icons. | Strict Server/Client Component separation; Tailwind utility composition via `cn()`. |
| **D-03, D-36, D-41, D-49** | 1 MVP template (`modern-minimalist`), `Inter` font only on invoice & PDF (`@react-pdf/renderer`). | Invoice template components must not import App UI fonts; all monetary/number outputs use `tabular-nums`. |
| **D-48** | Payment Gateway Adapter pattern (`Xendit`, `Midtrans`, `Mayar`). | No gateway-specific SDK imports outside `src/lib/billing/*-adapter.ts`. |
| **NFR-4** | Exact money math without floating-point errors. | Direct `+`, `-`, `*` on raw floats for invoice totals outside `src/lib/domain/calculations.ts` is forbidden. |
| **NFR-5** | `Asia/Jakarta` (`WIB`) timezone for dates, yearly reset, and subscription reminders. | Never use bare `new Date().getFullYear()` on the server without converting to `Asia/Jakarta` via `src/lib/domain/timezone.ts`. |
| **NFR-6** | Server-side enforcement of all plan & role rules. | Every Server Action calls `EntitlementService` before mutating data. |

---

## 2. TypeScript Standards

| ID | Rule | Level |
| :--- | :--- | :--- |
| **CS-TS-1** | **`strict: true` & `noUncheckedIndexedAccess: true`:** Enabled in `tsconfig.json`. Zero `tsc --noEmit` errors allowed. | MUST |
| **CS-TS-2** | **No `any` or `@ts-ignore`:** Use `unknown` and narrow types with `Zod` or type guards. | MUST |
| **CS-TS-3** | **Explicit Return Types on Domain & API Boundaries:** All functions in `src/lib/domain/**`, `src/lib/billing/**`, and all Server Actions (`actions.ts`) **MUST** declare explicit return types (`Promise<ActionResult<T>>`). | MUST |
| **CS-TS-4** | **Discriminated Unions over Exceptions:** Server Actions return `ActionResult<T>` (`{ ok: true, data } | { ok: false, error }`, `API.md` Section 2.1) rather than throwing raw errors to client components. | MUST |
| **CS-TS-5** | **Shared Zod Schemas:** Input validation schemas live in `src/lib/validations/` and are used on both the React Hook Form client side and inside Server Actions. | MUST |

---

## 3. File, Directory & Symbol Naming

| Artifact Type | Convention | Example |
| :--- | :--- | :--- |
| **Directories & Files** | `kebab-case` | `src/features/invoices/components/line-items-editor.tsx` |
| **Next.js App Router Files** | Framework standard (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`) — **re-export only** | `src/app/(app)/invoices/[id]/page.tsx` |
| **Feature Module Files** | `index.ts`, `page.tsx`, `metadata.ts`, `actions.ts`, `queries/<feature>-queries.ts`, `hooks/use-<feature>.ts`, `components/*.tsx`, `types/index.ts` | `src/features/invoices/hooks/use-invoice-builder.ts` |
| **React Components** | `PascalCase` (named exports for feature/shared components; default re-export in `src/app/**/page.tsx`) | `export function InvoiceLivePreview(...)` |
| **Functions & Variables** | `camelCase` | `calculateInvoiceTotals()`, `isPublicLinkEnabled` |
| **Server Actions** | `camelCase` ending with `Action` | `saveInvoiceDraftAction`, `issueInvoiceAction` |
| **Types & Interfaces** | `PascalCase` (no `I` prefix) | `InvoiceRenderProps`, `PaymentGatewayAdapter` |
| **Constants & Env Keys** | `UPPER_SNAKE_CASE` | `MAX_FREE_INVOICES = 3`, `SUPPORTED_CURRENCIES` |
| **Database Columns** | `snake_case` (mapped to `camelCase` at the repository/domain boundary) | `invoice_number`, `current_period_end` |

---

## 4. Next.js App Router & Feature Architecture Conventions (`app/` + `features/`)

1. **`src/app/` Routing vs. `src/features/` Feature Ownership:**
   - **No UI, hooks, queries, or business logic in `src/app/`:** Every route `src/app/**/page.tsx` **MUST** only re-export the page component and metadata from `src/features/<feature>`:
     ```tsx
     import { DashboardPage, dashboardMetadata } from '@/features/dashboard';

     export const metadata = dashboardMetadata;

     export default DashboardPage;
     ```
   - **Feature Folder Layout (`src/features/<feature>/`):**
     - `index.ts` — barrel exporting `<Feature>Page`, `<feature>Metadata`, and public actions/types
     - `page.tsx` — page-level Server Component (layout & data orchestration)
     - `metadata.ts` — Next.js `Metadata` or `generateMetadata`
     - `actions.ts` — Next.js Server Actions (`'use server'`) for the feature
     - `queries/<feature>-queries.ts` — data-fetching / query definitions
     - `hooks/use-<feature>.ts` — client composition hooks & local UI state
     - `components/` — UI components private to the feature
     - `config/` — static per-feature configuration
     - `types/index.ts` — feature-scoped TypeScript interfaces
   - **Sub-Features:** Nested routes (e.g., `/invoices/new`, `/invoices/[id]`, `/settings/billing`) nest one level under their parent feature (`src/features/invoices/new/`, `src/features/invoices/detail/`, `src/features/settings/billing/`) and share the parent's `actions.ts`, `queries/`, `hooks/`, and `components/`.
   - **Shared `src/components/`:** Reserved strictly for cross-feature primitives (`src/components/ui/`), app-shell layouts (`src/components/layout/`), and shared invoice templates (`src/components/invoice-templates/`).
2. **Server Components by Default:**
   - Every component is a React Server Component unless it requires browser interactivity (`useState`, `useEffect`, event handlers, `react-hook-form`).
   - Add `'use client'` at the **lowest possible leaf component** inside `src/features/<feature>/components/`, keeping `src/features/<feature>/page.tsx` on the server.
3. **Data Fetching & Mutations:**
   - Read queries in `(app)` pages run via `src/features/<feature>/queries/<feature>-queries.ts` called from the Server Component `page.tsx` using the server Supabase client (`createClient()`).
   - Authenticated mutations use Next.js Server Actions (`'use server'`) in `src/features/<feature>/actions.ts` that validate inputs with `Zod`, verify entitlements via `EntitlementService`, mutate via Supabase, and call `revalidatePath()`.
4. **Environment Variable Safety (`SECURITY.md` Section 8.2):**
   - Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `PAYMENT_GATEWAY_SECRET_KEY`, `CRON_SECRET`) are accessed through a server-only helper (`import 'server-only'`) so bundling them into a Client Component fails at build time.

---

## 5. Styling & Design System Rules (`DESIGN_SYSTEM.md`)

1. **Class Merging:** Always use `cn(...)` (`clsx` + `tailwind-merge` from `src/lib/utils.ts`) when conditionally combining Tailwind classes.
2. **Typography Enforcement (`D-41`):**
   - Application UI uses `font-sans` (`Plus Jakarta Sans`).
   - Invoice template components (`src/components/invoice-templates/**`) **MUST** apply `font-invoice` (`Inter`) to the root invoice container and **MUST NOT** override any child element with another font family.
3. **Tabular Numerals:**
   - Every element displaying a price, quantity, tax rate, date, or invoice number **MUST** include the `tabular-nums` utility class (`DESIGN_SYSTEM.md` Section 4.3).
4. **Light Mode Only (`D-34`):**
   - Do not add `dark:*` Tailwind variants in MVP code.
5. **Bilingual Text (`D-09`, `D-17`, `D-47`):**
   - Never hardcode user-facing English or Indonesian strings inside JSX.
   - App UI components read strings from `src/lib/i18n/ui-dictionary.ts`.
   - Invoice template components (`WebPreview` and `PdfDocument`) read labels exclusively from `src/lib/i18n/invoice-dictionary.ts` based on `invoice.language` (`'en' | 'id'`).

---

## 6. Financial Math & Timezone Guardrails (`NFR-4`, `NFR-5`)

1. **Money Calculations (`NFR-4`):**
   - All line item totals, discounts, taxes, and grand totals **MUST** be computed via `calculateInvoiceTotals()` in `src/lib/domain/calculations.ts`.
   - UI components display the output of `calculateInvoiceTotals()` and `formatCurrency(amount, currency)`; they never write inline math like `qty * price * (1 + taxRate / 100)`.
2. **Timezone Handling (`NFR-5`):**
   - All business date helpers live in `src/lib/domain/timezone.ts` (`getTodayWibDateString()`, `isPastDueInWib(dueDate)`, `getDaysUntilExpiryWib(periodEnd)`), explicitly using `timeZone: 'Asia/Jakarta'`.

---

## 7. Linting, Formatting & Pre-Commit Checks

- **Linter:** ESLint (`eslint-config-next` + `@typescript-eslint/recommended`).
- **Formatter:** Prettier with `prettier-plugin-tailwindcss` (2 spaces indentation, single quotes, trailing commas `all`, print width `100`).
- **CI Quality Gate:** Every commit/PR must pass:
  1. `npm run typecheck` (`tsc --noEmit`)
  2. `npm run lint` (`eslint .`)
  3. `npm run test` (Vitest unit & domain tests)

---

## 8. Assumptions & Open Questions

### 8.1 Assumptions
| ID | Assumption |
| :--- | :--- |
| **CS-A01** | Package manager is `npm` (matching the workspace Node v22 / npm v11 setup), with exact lockfile committed (`package-lock.json`). |

### 8.2 Open Questions
No unresolved code style questions remain.

---

## 9. Change history

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0.0 | 2026-10-27 | Initial coding standards aligned with `PRD.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, and `SECURITY.md`. |
