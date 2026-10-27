# AGENTS — Operating Manual & Guardrails for AI Coding Agents

> Canonical copy located at [`docs/AGENTS.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/AGENTS.md). Keep both files in sync (`AG-A01`).

| Field | Value |
| :--- | :--- |
| Product name | **Tagiva** (`tagiva.com`, see `docs/PRD.md` `D-59`) |
| Document status | **Approved** |
| Version | 1.0.0 |
| Last updated | 2026-10-27 |
| Depends on | All documents in `docs/` (`PRD.md` through `TESTING.md`) |

---

## 0. Purpose of this document

This document is the **entry point and rulebook for AI coding agents** working in this repository.

Its goals are:
1. Point agents to the exact source-of-truth document for any product, UI, database, API, security, or testing question.
2. Prevent agents from hallucinating features, re-introducing superseded ideas (such as guest invoice creation or Stripe), or bypassing server-side entitlement checks.

---

## 1. Documentation Map & Precedence Order

Before writing or modifying any application code, agents **MUST** consult the relevant specification in `docs/`. If two documents appear to conflict, **higher-ranked documents win**:

| Rank | Document | What It Controls |
| :---: | :--- | :--- |
| **1** | [`docs/PRD.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/PRD.md) | **Master Decision Log (`D-01`–`D-60`)**, product scope, roles (`Visitor`, `Free`, `Pro`, `Lapsed`), pricing (`D-16`), and business rules. |
| **2** | [`docs/DESIGN_SYSTEM.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/DESIGN_SYSTEM.md) | Light-mode color tokens (`D-34`, `D-35`), typography (`Plus Jakarta Sans` in UI; **`Inter` only** on invoice/PDF, `D-41`), status badges, and the single A4 invoice template (`D-03`, `D-36`). |
| **3** | [`docs/UX_FLOWS.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/UX_FLOWS.md) | Route inventory, user journeys, onboarding (`D-38`), status transitions, delete rules, and Lapsed read-only screens. |
| **4** | [`docs/ARCHITECTURE.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/ARCHITECTURE.md) | Directory structure, `EntitlementService`, `NumberingService`, `MoneyCalculator`, `PaymentGatewayAdapter` (`D-48`), `@react-pdf/renderer` (`D-49`), and Vercel Cron (`D-50`). |
| **5** | [`docs/DATABASE.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/DATABASE.md) | PostgreSQL tables, `CHECK` constraints, `issue_invoice` atomic RPC (`D-56`), `get_user_plan_state` RPC (`D-52`), RLS policies, and Storage policies. |
| **6** | [`docs/API.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/API.md) | Server Action schemas (`Zod`), `ActionResult<T>` envelope, error codes, PDF/webhook/cron Route Handlers, and rate limits (`D-57`). |
| **7** | [`docs/SECURITY.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/SECURITY.md) | Google OAuth PKCE (`D-14`), RLS defense-in-depth, public token entropy, magic-byte logo check (`A-06`), and UU PDP compliance (`D-58`). |
| **8** | [`docs/CODE_STYLE.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/CODE_STYLE.md) | TypeScript strictness, naming conventions, Server vs. Client component boundaries, money math, and `Asia/Jakarta` (`WIB`) timezone helpers. |
| **9** | [`docs/TESTING.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/TESTING.md) | Vitest & Playwright test suites and mandatory test cases (`TC-CALC-*`, `TC-NUM-*`, `TC-ENT-*`, `TC-BILL-*`, `TC-SEC-*`). |

---

## 2. Non-Negotiable Product & Engineering Guardrails (DO NOT VIOLATE)

Agents **MUST NEVER** violate any of the following confirmed decisions:

1. **No Unauthenticated Invoice Creation or Preview (`D-24`, `D-31`):**
   - Visitors **cannot** create, preview, or download an invoice without signing in with Google first (`D-14`). Do not build a guest PDF generator or guest device/IP tracker (`D-07`, `D-19`, and `D-20` were superseded).
2. **Drafts Show `[DRAFT]` — Never a Sequence Number (`D-30`, `D-42`, `D-55`):**
   - While `status === 'draft'`, `invoice_number` in PostgreSQL **MUST** be `NULL` and render literally as `[DRAFT]` in both English and Indonesian.
   - A permanent number (`INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`, `D-13`) is assigned **only** when the invoice leaves `Draft` via the `issue_invoice(p_invoice_id)` database RPC (`D-56`).
   - Never allow manual free-text override of the invoice number (`D-55`).
3. **Invoice Sequence Rules (`D-13`, `D-18`, `D-39`, `D-54`, `D-56`):**
   - `PREFIX` is `2–6` uppercase alphanumeric characters (`^[A-Z0-9]{2,6}$`), configurable by both `Free` and `Pro` users.
   - Changing `PREFIX` **does not** reset the sequence (`D-18`).
   - The `XXXX` sequence belongs to `(user_id, EXTRACT(YEAR FROM issue_date))` and resets to `0001` only when the invoice's `issue_date` is in a new calendar year (`D-56`).
4. **Free Plan Cap & Delete Restrictions (`D-12`, `D-21`, `D-29`):**
   - Free users can save at most **3 invoices in total** (not per month).
   - Deleting a `Draft` invoice gives back 1 Free slot (`D-21`).
   - Free users **cannot delete** `Sent`, `Overdue`, or `Paid` invoices (`D-29`).
5. **Lapsed User Rules (`D-23`, `D-27`, `D-28`, `D-33`, `D-40`):**
   - When Pro expires (after any 3-day `past_due` grace period for auto-renew, `D-52`), the user is `Lapsed`.
   - On existing invoices, all fields and actions are **read-only**, **EXCEPT** marking a `Sent` or `Overdue` invoice as `Paid` (`D-28`).
   - Existing invoices keep their uploaded logo (`D-27`), and existing public links (`/i/[token]`) stay viewable by the client with the platform footer added (`D-40`).
   - Lapsed users with `< 3` total saved invoices can create new invoices up to the 3-invoice cap (`D-33`) under Free tier rules (`A-23`).
6. **Indonesian Payment Gateway Adapter — No Stripe (`D-10`, `D-16`, `D-22`, `D-48`):**
   - Do **not** install or use Stripe.
   - All subscription checkout and webhook logic must go through `PaymentGatewayAdapter` (`src/lib/billing/adapter.ts`) supporting `1m (Rp29.000)`, `3m (Rp79.000)`, `6m (Rp150.000)`, and `12m (Rp250.000)` in both `manual` and `auto_renew` modes.
7. **Typography & Visual Rules (`D-34`, `D-35`, `D-36`, `D-41`):**
   - Light mode only (`D-34`).
   - Application UI uses `Plus Jakarta Sans`.
   - **The invoice template and PDF use `Inter` exclusively (`D-41`)** with `tabular-nums` and a fixed neutral black/slate palette (`D-36`).
8. **Exact Financial Math & `Asia/Jakarta` Timezone (`NFR-4`, `NFR-5`):**
   - Always compute invoice totals via `src/lib/domain/calculations.ts`.
   - Always evaluate dates, overdue status, and reminders in `Asia/Jakarta` (`WIB`, `UTC+07:00`) via `src/lib/domain/timezone.ts`.

---

## 3. Agent Workflow Protocol

1. **No Undocumented Business Decisions:**
   - If you encounter an ambiguous business requirement not covered by `D-01`–`D-58`, **stop and ask the user**—do not invent silent rules. Once answered, record the new decision ID in `docs/PRD.md` first.
2. **Test-First for Domain Logic:**
   - Any change to `src/lib/domain/**` (`entitlements.ts`, `calculations.ts`, `numbering.ts`, `status.ts`, `timezone.ts`) **MUST** include corresponding unit tests in `TESTING.md` (`npm test`).
3. **Keep Web Preview & PDF Template in Sync (`FR-7.1`):**
   - Any layout or label change in `src/components/invoice-templates/modern-minimalist/web-preview.tsx` **MUST** be mirrored in `pdf-document.tsx` and `src/lib/i18n/invoice-dictionary.ts`.
4. **Definition of Done for Every Task:**
   - `npm run typecheck` passes with `0` errors.
   - `npm run lint` passes with `0` errors.
   - `npm run test` passes all unit and integration tests.
5. **Feature Task Tracking Convention (`docs/[feature-name]/task.md`):**
   - Every feature's task breakdown and execution checklist **MUST** be stored at `docs/[feature-name]/task.md` (for the core MVP: [`docs/tagiva/task.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/tagiva/task.md)).
   - Execute tasks one by one as requested by the user, and mark each task `[x]` in `docs/[feature-name]/task.md` once its verification criteria pass.
6. **Feature-First Directory Architecture (`src/features/` + `src/app/`):**
   - Every feature's `page.tsx`, `metadata.ts`, `actions.ts`, `queries/`, `hooks/`, `components/`, `config/`, and `types/` **MUST** live inside `src/features/<feature>/` and be barrel-exported via `src/features/<feature>/index.ts`.
   - `src/app/` is strictly for Next.js routing: route `page.tsx` files in `src/app/**` **MUST** only re-export the feature's page component and metadata (`import { <Feature>Page, <feature>Metadata } from '@/features/<feature>'`). Never put feature UI, hooks, queries, or Server Actions directly inside `src/app/`.
