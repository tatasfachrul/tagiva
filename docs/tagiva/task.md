# Tagiva MVP — Step-by-Step Implementation Task Breakdown

| Field | Value |
| :--- | :--- |
| Feature name | `tagiva` (Tagiva Core MVP) |
| Task file path | `docs/tagiva/task.md` |
| Product & domain | **Tagiva** (`tagiva.com`, `D-59`, `D-60`) |
| Status | **Ready for Step-by-Step Execution** |
| Last updated | 2026-10-27 |
| Source Specifications | [`docs/PRD.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/PRD.md), [`docs/DESIGN_SYSTEM.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/DESIGN_SYSTEM.md), [`docs/UX_FLOWS.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/UX_FLOWS.md), [`docs/ARCHITECTURE.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/ARCHITECTURE.md), [`docs/DATABASE.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/DATABASE.md), [`docs/API.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/API.md), [`docs/SECURITY.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/SECURITY.md), [`docs/CODE_STYLE.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/CODE_STYLE.md), [`docs/TESTING.md`](file:///Users/tatasfachrul/Project/Personal/invoice/docs/TESTING.md) |

---

## 0. How to Use This Task Breakdown

This document breaks the entire **Tagiva** MVP into **15 self-contained, sequential tasks (`T-01` through `T-15`)** grouped into 6 logical phases.

- **Execution Rule:** Execute one task at a time (for example: *"Execute T-01"*).
- **Completion Criteria per Task:**
  1. All files listed in the task are implemented according to the referenced specification sections and decision IDs (`D-01`–`D-60`).
  2. All unit/integration tests specified for that task pass (`npm run test`).
  3. `npm run typecheck` and `npm run lint` pass with `0` errors.
  4. The task checkbox in `docs/tagiva/task.md` is updated from `[ ]` to `[x]`.

---

## Phase 1: Project Foundation, Design Tokens & Core Domain Engine

### [x] `T-01` — Next.js Scaffolding, Tooling, Fonts & Design System Tokens
- **Objective:** Initialize the Next.js (App Router) TypeScript project, configure linting/testing tooling, register fonts (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`), configure the light-mode color system, and wire up core `shadcn/ui` primitives and the Tagiva brand logo.
- **Specification References:**
  - `PRD.md`: `D-02`, `D-34`, `D-35`, `D-37`, `D-41`, `D-59`, `D-60`
  - `DESIGN_SYSTEM.md`: Sections 3.1–3.4 (Colors & Logo), Section 4 (Typography), Section 5 (Spacing), Section 6 (UI Primitives)
  - `CODE_STYLE.md`: Sections 2, 5, 7 (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Deliverables / Files:**
  - `package.json`, `tsconfig.json`, `next.config.ts` (with security headers from `SECURITY.md` Section 8.1), `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`
  - `public/logo.png` (already added, `D-60`) & `public/fonts/inter/*.ttf` (`Regular`, `Medium`, `SemiBold`, `Bold` for `@react-pdf/renderer`, `D-41`, `D-49`)
  - `src/app/globals.css` & `src/app/layout.tsx` (CSS variables for Deep Slate & Royal Blue/Indigo light-mode palette, `--font-sans` = `Plus Jakarta Sans`, `--font-invoice` = `Inter`, `--font-mono` = `JetBrains Mono`)
  - `src/lib/utils.ts` (`cn` helper) & `src/components/ui/*` (Button, Input, Label, Textarea, Select, Badge, Card, Dialog, DropdownMenu, Tabs, Tooltip, Popover, Separator, Toast/Sonner)
  - `src/components/layout/tagiva-logo.tsx` (reusable Tagiva logo + wordmark component following `DESIGN_SYSTEM.md` Section 3.4)
- **Verification Criteria:**
  - `npm run typecheck`, `npm run lint`, and `npm run test` run cleanly with 0 errors.

---

### [x] `T-02` — Pure Domain Engine & Unit Test Suite (`calculations`, `timezone`, `numbering`, `status`, `entitlements`)
- **Objective:** Build the 100% unit-tested, framework-agnostic domain layer enforcing all Tagiva financial, numbering, timezone, status, and plan entitlement rules.
- **Specification References:**
  - `PRD.md`: `D-11`–`D-13`, `D-15`, `D-18`, `D-21`, `D-23`, `D-28`–`D-30`, `D-33`, `D-39`, `D-40`, `D-42`, `D-44`–`D-46`, `D-52`, `D-54`–`D-56`, `NFR-4`, `NFR-5`, `NFR-6`
  - `ARCHITECTURE.md`: Sections 4.2, 4.3, 4.4, 4.7
  - `TESTING.md`: Sections 3.1 (`TC-CALC-01`–`05`), 3.2 (`TC-NUM-01`–`07`), 3.3 (`TC-ENT-01`–`10`)
- **Deliverables / Files:**
  - `src/lib/domain/calculations.ts` (exact integer minor-unit math for line totals, `%` or `fixed` discount, taxable subtotal, tax amount, grand total, and locale-aware currency formatting for `IDR, USD, SGD, EUR, AUD, GBP, MYR, JPY`)
  - `src/lib/domain/timezone.ts` (`Asia/Jakarta` WIB date helpers: `getTodayWib()`, `getYearAndMonthFromDate()`, `isPastDueInWib()`, `getDaysUntilDateWib()`)
  - `src/lib/domain/numbering.ts` (prefix validator `^[A-Z0-9]{2,6}$`, default prefix generator from name, `formatInvoiceNumber()`, and `[DRAFT]` formatter)
  - `src/lib/domain/status.ts` (effective status resolver `draft | sent | paid | overdue`, client-facing status mapper `unpaid | paid | overdue` per `D-43`, and valid status transition checks)
  - `src/lib/domain/entitlements.ts` (`resolveUserPlanState()`, `canCreateInvoice()`, `canEditInvoice()`, `canDeleteInvoice()`, `canChangeStatus()`, `canUseProFeature()`, `shouldIncludePlatformFooter()`)
  - `src/lib/domain/__tests__/*.test.ts` (complete Vitest unit tests covering `TC-CALC-*`, `TC-NUM-*`, `TC-ENT-*`)
- **Verification Criteria:**
  - 100% statement and branch coverage on `src/lib/domain/**` via `npm run test`.

---

### [x] `T-03` — Bilingual Dictionaries (`EN` & `ID`), Shared Zod Schemas & Action Envelope
- **Objective:** Implement the English and Bahasa Indonesia dictionaries (separated between App UI and Invoice Document) and shared Zod validation schemas + `ActionResult<T>` helpers.
- **Specification References:**
  - `PRD.md`: `D-09`, `D-17`, `D-25`, `D-32`, `D-44`–`D-47`, `D-54`
  - `DESIGN_SYSTEM.md`: Section 7.4 (Bilingual Template Label Dictionary)
  - `API.md`: Section 2 (`ActionResult<T>`, `ApiErrorCode`) & Section 3 (Zod Schemas)
- **Deliverables / Files:**
  - `src/lib/i18n/invoice-dictionary.ts` (exact EN & ID invoice labels from `DESIGN_SYSTEM.md` Section 7.4, always rendering `[DRAFT]` for drafts per `D-42`)
  - `src/lib/i18n/ui-dictionary.ts` (EN & ID application UI strings for navigation, dashboard, builder, settings, modals, and localized error messages)
  - `src/lib/api/action-result.ts` (`ActionResult<T>`, `ApiErrorCode`, `ok()`, `err()` helpers)
  - `src/lib/validations/profile.ts`, `src/lib/validations/invoice.ts`, `src/lib/validations/billing.ts`
  - `src/lib/validations/__tests__/schemas.test.ts`
- **Verification Criteria:**
  - All Zod schema validation tests pass (`npm run test`) and `npm run typecheck` succeeds.

---

## Phase 2: Database Schema, Atomic RPCs, RLS & Google Authentication

### [x] `T-04` — Supabase SQL Migration (Tables, Constraints, Atomic RPCs, RLS & Storage) & DB Types
- **Objective:** Create the canonical SQL migration implementing all tables, `CHECK` constraints, indexes, triggers, atomic RPC functions, Row Level Security (RLS) policies, and Storage bucket policies, plus matching TypeScript database types.
- **Specification References:**
  - `DATABASE.md`: Sections 2, 3, 4, 5
  - `PRD.md`: `D-03`, `D-04`, `D-12`, `D-13`, `D-18`, `D-21`, `D-27`–`D-30`, `D-33`, `D-52`–`D-57`
- **Deliverables / Files:**
  - `supabase/migrations/20261027000001_init_tagiva_schema.sql`:
    - Tables: `profiles`, `invoice_sequences`, `customers`, `invoices`, `invoice_items`, `subscriptions`, `billing_events`, `subscription_reminders`, `invoice_email_logs`
    - Trigger: `handle_new_user()` on `auth.users` (`DB-A01`)
    - RPCs: `get_user_plan_state(p_user_id)`, `issue_invoice(p_invoice_id)` (`D-56`), `get_public_invoice_by_token(p_token)` (`DB-A03`)
    - RLS Policies on all 9 tables + `business-logos` Storage bucket policy (`A-06`)
  - `src/types/database.ts` (strict TypeScript definitions for all tables and RPCs)
- **Verification Criteria:**
  - SQL syntax and constraint invariants verified; `src/types/database.ts` compiles cleanly with `npm run typecheck`.

---

### [x] `T-05` — Supabase Clients, Google OAuth Flow (`/login`, `/auth/callback`) & Route Protection Middleware
- **Objective:** Wire up browser, server, and service-role Supabase clients, enforce the Visitor authentication gate via Next.js Middleware, and build the Google Sign-In flow inside `src/features/auth/`.
- **Specification References:**
  - `PRD.md`: `D-14`, `D-24`, `D-31`, `D-38`, `D-60`
  - `ARCHITECTURE.md`: Section 3 & Section 4.1
  - `SECURITY.md`: Section 2 (`SEC-AUTH-1`–`SEC-AUTH-4`), Section 3 (`Service-Role Key Restriction`)
  - `UX_FLOWS.md`: Section 3.1 (Flow 1)
- **Deliverables / Files:**
  - `src/lib/supabase/client.ts` (browser client)
  - `src/lib/supabase/server.ts` (cookie-based server client + `getAuthenticatedUser()` helper using `supabase.auth.getUser()`, `SEC-AUTH-3`)
  - `src/lib/supabase/admin.ts` (guarded by `import 'server-only'`)
  - `src/middleware.ts` (session refresh + unauthenticated redirect to `/login` for `/onboarding`, `/dashboard`, `/invoices/*`, `/clients`, `/settings/*`)
  - `src/features/auth/` (`page.tsx`, `metadata.ts`, `actions.ts`, `hooks/use-google-sign-in.ts`, `components/google-sign-in-button.tsx`, `index.ts`)
  - `src/app/(auth)/login/page.tsx` (thin routing re-export of `LoginPage` & `loginMetadata` from `@/features/auth`)
  - `src/app/(auth)/auth/callback/route.ts` (PKCE code exchange, open-redirect check `SEC-AUTH-4`, redirects first-time users with `onboarding_completed = false` to `/onboarding` and returning users to `/dashboard`)
- **Verification Criteria:**
  - Unit tests for open-redirect sanitizer and middleware route-matching rules pass; `npm run typecheck` and `npm run lint` pass.

---

## Phase 3: Onboarding, Authenticated App Shell & Business Settings

### [x] `T-06` — 1-Step Business Onboarding (`/onboarding`) & Profile/Logo Server Actions
- **Objective:** Build the post-signup 1-Step Business Setup screen (`D-38`) in `src/features/onboarding/` and the profile & Pro logo upload Server Actions in `src/features/settings/actions.ts` (including server-side magic-byte inspection).
- **Specification References:**
  - `PRD.md`: `D-04`, `D-11`, `D-13`, `D-25`, `D-32`, `D-38`, `D-39`, `D-54`, `A-06`
  - `UX_FLOWS.md`: Section 3.1 (`/onboarding` fields & `"Skip for now"` action)
  - `API.md`: Section 3.1 (`updateBusinessProfileAction`, `uploadBusinessLogoAction`, `removeBusinessLogoAction`)
  - `SECURITY.md`: Section 5 (PNG/JPG/WEBP magic-byte verification, 2 MB limit, SVG rejection)
- **Deliverables / Files:**
  - `src/lib/security/file-validation.ts` (PNG, JPEG, WEBP magic-byte inspector + unit tests `TC-SEC-02`)
  - `src/features/settings/actions.ts` (`updateBusinessProfileAction`, `uploadBusinessLogoAction`, `removeBusinessLogoAction`, `skipOnboardingAction`)
  - `src/features/onboarding/` (`page.tsx`, `metadata.ts`, `index.ts`, `hooks/use-onboarding-form.ts`, `components/onboarding-form.tsx` with live prefix preview `INV-TAT-2026-10-0001`, currency selector default `IDR`, default invoice language toggle `EN | ID`, bank details, and `"Skip for now"`)
  - `src/app/(app)/onboarding/page.tsx` (thin re-export of `OnboardingPage` & `onboardingMetadata` from `@/features/onboarding`)
- **Verification Criteria:**
  - `TC-SEC-02` (magic-byte validation rejecting SVG/spoofed files) and profile action tests pass (`npm run test`).

---

### [x] `T-07` — Authenticated App Shell, Plan Indicators, `/settings` & `/clients` Directory
- **Objective:** Build the authenticated `(app)` layout shell with navigation, UI language switcher (`EN | ID`), Free Tier Slot Counter (`X / 3`), Subscription Expiry Banner (`30d/14d/3d/0d`), Lapsed Read-Only Banner, Business Settings feature (`src/features/settings/`), and Clients Directory feature (`src/features/clients/`).
- **Specification References:**
  - `PRD.md`: `D-04`, `D-12`, `D-23`, `D-25`, `D-26`, `D-28`, `D-32`, `D-39`, `D-47`, `D-58`, `D-60`, `FR-4.3`–`FR-4.5`, `FR-5.11`
  - `DESIGN_SYSTEM.md`: Section 3.4 (Tagiva header lockup), Section 6.2 (Plan & Entitlement Visual Indicators)
  - `UX_FLOWS.md`: Section 2 (`/settings`, `/clients`)
- **Deliverables / Files:**
  - `src/app/(app)/layout.tsx`
  - `src/components/layout/app-sidebar.tsx` & `src/components/layout/app-header.tsx` (includes `EN | ID` UI language switcher and Default Invoice Language quick toggle `D-25`)
  - `src/components/layout/free-slot-counter.tsx` (`1 / 3 Free slots` progress bar + Upgrade CTA)
  - `src/components/layout/subscription-banners.tsx` (Expiry reminder banner `D-26` + Lapsed read-only banner `D-28`)
  - `src/features/settings/` (`page.tsx`, `metadata.ts`, `index.ts`, `queries/settings-queries.ts`, `hooks/use-settings-form.ts`, `components/business-profile-form.tsx`, `components/logo-uploader.tsx` with `PRO` badge lock for Free/Lapsed, and UU PDP manual account deletion instructions via `support@tagiva.com`, `D-58`)
  - `src/app/(app)/settings/page.tsx` (thin re-export from `@/features/settings`)
  - `src/features/clients/` (`page.tsx`, `metadata.ts`, `index.ts`, `actions.ts`, `queries/client-queries.ts`, `hooks/use-clients.ts`, `components/clients-list.tsx`, `components/client-form-dialog.tsx`)
  - `src/app/(app)/clients/page.tsx` (thin re-export from `@/features/clients`)
- **Verification Criteria:**
  - `npm run typecheck`, `npm run lint`, and `npm run test` pass.

---

## Phase 4: "Modern Minimalist" Template, PDF Engine, Invoice Builder & Dashboard

### [x] `T-08` — Single MVP Invoice Template ("Modern Minimalist") — Web Preview & `@react-pdf/renderer` PDF Engine
- **Objective:** Build the pixel-accurate A4 "Modern Minimalist" invoice template in both HTML/Tailwind (`WebPreview`) and `@react-pdf/renderer` (`PdfDocument`), using `Inter` exclusively (`D-41`), plus the authenticated and public PDF download API routes.
- **Specification References:**
  - `PRD.md`: `D-03`, `D-11`, `D-17`, `D-27`, `D-28`, `D-30`, `D-36`, `D-40`–`D-43`, `D-49`, `FR-7.1`–`FR-7.5`
  - `DESIGN_SYSTEM.md`: Section 7 (Template Geometry, Header, `[DRAFT]`, Line Items, Totals, Payment Instructions, Platform Footer `Made with Tagiva • tagiva.com`, Bilingual Labels)
  - `API.md`: Sections 4.1 (`GET /api/invoices/[id]/pdf`) & 4.2 (`GET /api/public/i/[token]/pdf`)
  - `SECURITY.md`: Section 5 (SSRF prevention on `logo_url` in PDF renderer)
- **Deliverables / Files:**
  - `src/components/invoice-templates/types.ts` (`InvoiceRenderProps`)
  - `src/components/invoice-templates/modern-minimalist/web-preview.tsx` (`Inter` font, `tabular-nums`, status badge, `[DRAFT]` box, retained logo `D-27`, conditional footer)
  - `src/components/invoice-templates/modern-minimalist/pdf-document.tsx` (`@react-pdf/renderer` with registered `Inter` `.ttf` fonts)
  - `src/app/api/invoices/[id]/pdf/route.ts`
  - `src/app/api/public/i/[token]/pdf/route.ts`
  - `src/components/invoice-templates/__tests__/modern-minimalist.test.tsx` (verifying `[DRAFT]` rendering, EN/ID labels, Pro vs. Free/Lapsed footer, and retained logo on Lapsed invoices)
- **Verification Criteria:**
  - Template rendering tests and PDF buffer generation tests pass (`npm run test`).

---

### [x] `T-09` — Interactive Invoice Builder (`/invoices/new`, `/invoices/[id]`) & Invoice Lifecycle Server Actions
- **Objective:** Implement the core invoice feature (`src/features/invoices/`): Server Actions (`saveInvoiceDraftAction`, `issueInvoiceAction`, `updateInvoiceStatusAction`, `deleteInvoiceAction`, `duplicateInvoiceAction`), queries, hooks, and the responsive split-screen/tabbed Invoice Builder UI.
- **Specification References:**
  - `PRD.md`: `D-12`, `D-13`, `D-15`, `D-17`, `D-18`, `D-21`, `D-23`, `D-25`, `D-27`–`D-30`, `D-32`, `D-33`, `D-44`–`D-46`, `D-55`, `D-56`, `FR-1`, `FR-2`, `FR-5`
  - `DESIGN_SYSTEM.md`: Section 5.2 (Desktop 50/50 split vs. Mobile `Edit Form | Live Preview` segmented toggle)
  - `UX_FLOWS.md`: Sections 3.2 & 3.3 (Action Permission Matrix by Role & Status, Free `Sent` confirmation popover `UX-A03`)
  - `API.md`: Section 3.2
- **Deliverables / Files:**
  - `src/features/invoices/actions.ts` (`saveInvoiceDraftAction`, `issueInvoiceAction`, `updateInvoiceStatusAction`, `deleteInvoiceAction`, `duplicateInvoiceAction`)
  - `src/features/invoices/queries/invoice-queries.ts` & `src/features/invoices/hooks/use-invoice-builder.ts`
  - `src/features/invoices/components/invoice-builder.tsx` (responsive split-view + mobile tab toggle, sessionStorage draft restoration from landing page `A-22`, saved client picker `FR-5.11`, `"Use PPN 11%"` chip `D-44`, `% | Fixed` discount toggle `D-45`, currency & language selectors)
  - `src/features/invoices/components/invoice-action-bar.tsx` (Save Draft, Issue / Mark as Sent with `UX-A03` warning on Free, Download PDF, Mark as Paid, Delete, and Pro-badged Share Link / Send Email triggers)
  - `src/features/invoices/new/` (`page.tsx`, `metadata.ts`, `index.ts` — checks 3-invoice cap for Free/Lapsed `D-12`/`D-33`) & `src/app/(app)/invoices/new/page.tsx` (thin re-export)
  - `src/features/invoices/detail/` (`page.tsx`, `metadata.ts`, `index.ts` — loads invoice; enforces Lapsed read-only mode where all inputs are disabled except `"Mark as Paid"` on `Sent`/`Overdue` invoices, `D-28`) & `src/app/(app)/invoices/[id]/page.tsx` (thin re-export)
  - `src/features/invoices/__tests__/actions.test.ts` (`TC-NUM-08`, `TC-ENT-02`–`09`, `TC-SEC-01`)
- **Verification Criteria:**
  - All invoice lifecycle action tests pass (`npm run test`); `npm run typecheck` and `npm run lint` pass.

---

### [x] `T-10` — Invoices Dashboard (`/dashboard`)
- **Objective:** Build the main Invoices Dashboard inside `src/features/dashboard/` showing summary cards, status filter tabs (`All`, `Draft`, `Sent`, `Paid`, `Overdue`), client/number search, invoice table with role-aware row actions, and empty state.
- **Specification References:**
  - `PRD.md`: `D-12`, `D-15`, `D-21`, `D-28`–`D-30`, `D-33`, `FR-5.1`–`FR-5.12`
  - `DESIGN_SYSTEM.md`: Section 3.3 (Status Badges), Section 6.2 (Plan Indicators)
  - `UX_FLOWS.md`: Section 2 (`/dashboard`), Section 3.3 (Permission Matrix), Section 4 (Empty States)
- **Deliverables / Files:**
  - `src/features/dashboard/` (`page.tsx`, `metadata.ts`, `index.ts`, `queries/dashboard-queries.ts`, `hooks/use-dashboard-filters.ts`, `types/index.ts`)
  - `src/features/dashboard/components/invoice-summary-cards.tsx` (Total Paid, Total Outstanding, Overdue Count)
  - `src/features/dashboard/components/invoice-list-table.tsx` (status badges, `[DRAFT]` indicator, search & status filter, row dropdown with role-aware disabled states & tooltips for Free non-draft delete `D-29` and Lapsed read-only `D-28`)
  - `src/app/(app)/dashboard/page.tsx` (thin re-export from `@/features/dashboard`)
- **Verification Criteria:**
  - `npm run typecheck`, `npm run lint`, and `npm run test` pass.

---

## Phase 5: Pro Delivery Channels (Public Shareable Link & Resend Email)

### [x] `T-11` — Public Shareable Invoice Link (`/i/[token]`) & Link Management Modal
- **Objective:** Implement the Pro-only public link generator/revoker (`createOrTogglePublicLinkAction`) and the public client-facing invoice feature (`src/features/public-invoice/`).
- **Specification References:**
  - `PRD.md`: `D-11`, `D-17`, `D-40`, `D-41`, `D-43`, `FR-8.1`–`FR-8.4`
  - `UX_FLOWS.md`: Section 3.4A (Share Link Modal & Client Experience on `/i/[token]`), Section 4 (Invalid/Revoked Token 404 Card)
  - `API.md`: Section 3.3 (`createOrTogglePublicLinkAction`)
  - `SECURITY.md`: Section 4 (`SEC-PUB-1` 144-bit token entropy, `SEC-PUB-2` scoped RPC lookup, `SEC-PUB-3` `noindex, nofollow`, `SEC-PUB-4` instant revocation)
- **Deliverables / Files:**
  - `src/features/invoices/share-actions.ts` (`createOrTogglePublicLinkAction`)
  - `src/features/invoices/components/share-link-modal.tsx` (Copy link, Open in new tab, Revoke link toggle)
  - `src/features/public-invoice/` (`page.tsx`, `not-found-page.tsx`, `metadata.ts`, `index.ts`, `queries/public-invoice-queries.ts`, `components/public-invoice-toolbar.tsx` with client status badge `Unpaid / Paid / Overdue` `D-43`, Download PDF button, 1-click Copy Bank Account button, and `WebPreview` with platform footer added if sender is Lapsed `D-40`)
  - `src/app/(public-invoice)/i/[token]/page.tsx` & `src/app/(public-invoice)/i/[token]/not-found.tsx` (thin re-exports from `@/features/public-invoice`)
- **Verification Criteria:**
  - Integration tests verifying `Draft` auto-issuance on link creation (`FR-8.1`), `PRO_REQUIRED` check for Free/Lapsed users, revocation (`404`), and Lapsed footer behavior (`TC-ENT-10`) pass.

---

### [x] `T-12` — In-App Email Delivery via Resend (`sendInvoiceEmailAction` & React Email Template)
- **Objective:** Build the bilingual React Email template (`InvoiceEmail`), the Send Email modal, and `sendInvoiceEmailAction` with attached PDF and daily rate-limit enforcement (`50/day/account` and `5/day/invoice`).
- **Specification References:**
  - `PRD.md`: `D-11`, `D-17`, `D-51`, `D-57`, `FR-9.1`–`FR-9.6`
  - `UX_FLOWS.md`: Section 3.4B (Send via Email Modal)
  - `API.md`: Section 3.3 (`sendInvoiceEmailAction`)
  - `SECURITY.md`: Section 6.3 (Rate limits & header/HTML injection prevention)
- **Deliverables / Files:**
  - `src/lib/email/client.ts` (Resend wrapper with graceful mock fallback in test/dev)
  - `src/lib/email/templates/invoice-email.tsx` (Bilingual EN/ID email template with invoice summary, public link CTA, and sender details)
  - `src/features/invoices/email-actions.ts` (`sendInvoiceEmailAction` enforcing `D-57` against `invoice_email_logs`, auto-issuing `Draft`, generating PDF buffer, and sending via `invoices@tagiva.com` with `Reply-To` user email `D-51`)
  - `src/features/invoices/components/send-email-modal.tsx`
  - `src/features/invoices/__tests__/email-actions.test.ts` (`TC-SEC-03` verifying 50/day/account and 5/day/invoice rate limits)
- **Verification Criteria:**
  - `TC-SEC-03` and email dispatch tests pass (`npm run test`).

---

## Phase 6: Indonesian Payment Gateway Billing, Cron Jobs & Public Marketing Pages

### [x] `T-13` — Indonesian Payment Gateway Adapter, Pro Upgrade Checkout, Webhook & `/settings/billing`
- **Objective:** Implement the `PaymentGatewayAdapter` (`D-48`) supporting `1m (Rp29k)`, `3m (Rp79k)`, `6m (Rp150k)`, and `12m (Rp250k)` in both `manual` and `auto_renew` modes, the signed webhook handler (`POST /api/webhooks/billing`), and `src/features/settings/billing/`.
- **Specification References:**
  - `PRD.md`: `D-10`, `D-16`, `D-22`, `D-23`, `D-48`, `D-52`, `A-14`, `FR-10.1`–`FR-10.9`
  - `ARCHITECTURE.md`: Section 4.6 (`PaymentGatewayAdapter` contract)
  - `API.md`: Section 3.4 (`createSubscriptionCheckoutAction`, `cancelAutoRenewAction`) & Section 4.3 (`POST /api/webhooks/billing`)
  - `SECURITY.md`: Section 6.1 (Webhook signature verification, `billing_events` idempotency, server-side price authority)
- **Deliverables / Files:**
  - `src/lib/billing/adapter.ts` (`PaymentGatewayAdapter` interface & canonical pricing map `D-16`)
  - `src/lib/billing/xendit-adapter.ts` & `src/lib/billing/midtrans-adapter.ts` (configurable via `PAYMENT_GATEWAY_PROVIDER`)
  - `src/features/settings/billing/` (`page.tsx`, `metadata.ts`, `index.ts`, `actions.ts` with `createSubscriptionCheckoutAction` & `cancelAutoRenewAction`, `queries/billing-queries.ts`, `hooks/use-billing-checkout.ts`, `components/upgrade-pro-modal.tsx`)
  - `src/app/(app)/settings/billing/page.tsx` (thin re-export from `@/features/settings/billing`)
  - `src/app/api/webhooks/billing/route.ts` (signature check, idempotency check, period extension `A-14`, and 3-day `past_due` grace window `D-52`)
  - `src/lib/billing/__tests__/webhook.test.ts` (`TC-BILL-01`–`03`)
- **Verification Criteria:**
  - `TC-BILL-01`, `TC-BILL-02`, and `TC-BILL-03` pass (`npm run test`).

---

### [x] `T-14` — Daily Vercel Cron Job (`/api/cron/daily`) & Subscription Reminder Emails
- **Objective:** Implement the daily `08:00 WIB` (`01:00 UTC`) cron route handler that expires elapsed subscriptions, updates `Overdue` invoices, and dispatches deduplicated `30d/14d/3d/0d` manual reminders and `3d` auto-renew notices.
- **Specification References:**
  - `PRD.md`: `D-23`, `D-26`, `D-50`, `D-52`, `D-53`, `A-20`, `A-21`
  - `ARCHITECTURE.md`: Section 4.7
  - `API.md`: Section 4.4 (`GET /api/cron/daily`)
  - `SECURITY.md`: Section 6.2 (`CRON_SECRET` timing-safe verification)
- **Deliverables / Files:**
  - `vercel.json` (`crons: [{ path: "/api/cron/daily", schedule: "0 1 * * *" }]`)
  - `src/lib/email/templates/subscription-reminder-email.tsx` (Bilingual EN/ID reminder template for `30d/14d/3d/0d` manual expiry & `3d` auto-renew notice)
  - `src/app/api/cron/daily/route.ts`
  - `src/app/api/cron/daily/__tests__/cron.test.ts` (`TC-BILL-04`, `TC-BILL-05`)
- **Verification Criteria:**
  - `TC-BILL-04` and `TC-BILL-05` pass (`npm run test`).

---

### [x] `T-15` — Marketing Landing Page (`/`), Pricing Page (`/pricing`), Legal Pages & E2E Test Suite
- **Objective:** Build the public marketing features (`src/features/landing/`, `src/features/pricing/`, `src/features/legal/`) with the Visitor sign-in gate (`D-24`, `D-31`) and run the complete Playwright E2E and Vitest quality gates.
- **Specification References:**
  - `PRD.md`: `D-09`, `D-14`, `D-16`, `D-24`, `D-31`, `D-58`–`D-60`, `A-22`
  - `UX_FLOWS.md`: Section 2 (`/`, `/pricing`), Section 3.1 (Flow 1 Visitor Gate)
  - `TESTING.md`: Section 2 (Layer 4 Playwright E2E tests)
- **Deliverables / Files:**
  - `src/app/(marketing)/layout.tsx` & `src/components/layout/marketing-header.tsx` (Public header with Tagiva logo `D-60`, `EN | ID` switcher, Pricing link, and "Sign in with Google" CTA)
  - `src/features/landing/` (`page.tsx`, `metadata.ts`, `index.ts`, `components/` — Hero section, static interactive-looking sample of the "Modern Minimalist" invoice, feature highlights, and "Create / Preview Invoice" CTA that gates on Google Sign-In `D-31`) & `src/app/(marketing)/page.tsx` (thin re-export)
  - `src/features/pricing/` (`page.tsx`, `metadata.ts`, `index.ts`, `components/` — Free vs. Pro `1m / 3m / 6m / 12m` pricing cards `D-16` and FAQ) & `src/app/(marketing)/pricing/page.tsx` (thin re-export)
  - `src/features/legal/` (`terms/`, `privacy/`, `config/` — UU PDP privacy disclosures & manual account deletion instructions via `support@tagiva.com`, `D-58`) & `src/app/(marketing)/terms/page.tsx` + `src/app/(marketing)/privacy/page.tsx` (thin re-exports)
  - `playwright.config.ts` & `e2e/tagiva-flows.spec.ts` (Visitor gate `TC-ENT-01`, Desktop & Mobile responsive checks `NFR-1`, Public invoice page rendering)
- **Verification Criteria:**
  - `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` all succeed with 0 errors.
