# TESTING — Test Strategy, Acceptance Scenarios & Quality Gates

| Field | Value |
| :--- | :--- |
| Product name | **Tagiva** (`tagiva.com`, see `PRD.md` `D-59`) |
| Document status | **Approved** |
| Version | 1.0.0 |
| Last updated | 2026-10-27 |
| Depends on | `PRD.md` (v1.0.0), `UX_FLOWS.md` (v1.1.0), `ARCHITECTURE.md` (v1.1.0), `DATABASE.md` (v1.1.0), `API.md` (v1.0.0), `SECURITY.md` (v1.0.0), `CODE_STYLE.md` (v1.0.0) |

---

## 0. Purpose of this document

This document defines the **testing strategy**, **test pyramid**, **mandatory test cases mapped to every product decision (`D-01`–`D-58`)**, and **release verification gates**.

Its goals are:
1. Guarantee 100% test coverage on financial math (`NFR-4`), invoice numbering (`D-13`, `D-18`, `D-30`, `D-54`–`D-56`), and role/entitlement rules (`Free`, `Pro`, `Lapsed`, `D-11`, `D-12`, `D-21`–`D-33`).
2. Verify that database RLS policies and Server Actions reject unauthorized requests (`NFR-2`, `NFR-6`).

How to read requirement keywords:
- **MUST**: required before MVP launch.
- **SHOULD**: expected in automated CI.

---

## 1. Reused decisions from prior documents

| Decision ID | Summary | Required Test Verification |
| :--- | :--- | :--- |
| **D-12, D-21, D-29, D-33** | 3-slot cap on `Free`/`Lapsed`; deleting `Draft` restores slot; `Free` cannot delete `Sent`/`Overdue`/`Paid`. | Unit + Integration tests verifying slot consumption, restoration on draft delete, and rejection of non-draft delete on Free. |
| **D-13, D-18, D-30, D-42, D-54, D-55, D-56** | `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`; `[DRAFT]` while in draft; prefix change doesn't reset sequence; resets each `issue_date` year. | Unit + Database RPC concurrency tests verifying exact sequence progression across prefix changes and year boundaries. |
| **D-16, D-22, D-26, D-48, D-52, D-53** | 4 durations (`1m/3m/6m/12m`), manual extension vs. auto-renew, 3-day grace period, reminder schedule (`30d/14d/3d/0d` vs `3d`). | Webhook & Cron tests verifying period extension, idempotency, grace period, and reminder deduplication. |
| **D-23, D-27, D-28, D-40** | `Lapsed` rules: read-only except `Sent`/`Overdue` → `Paid`; logo stays on old invoices; existing public links stay viewable with footer. | Entitlement, RLS, and PDF/public-page rendering tests for Lapsed accounts. |
| **D-24, D-31** | Visitor cannot preview or create an invoice without signing in. | E2E test verifying unauthenticated visitor is redirected to Google sign-in on any preview/create attempt. |
| **D-57** | Email rate limits: **50/day/account** and **5/day/invoice**. | API test verifying 51st account email and 6th single-invoice email return `RATE_LIMIT_EXCEEDED`. |

---

## 2. Testing Stack & Pyramid

| Layer | Tooling | Scope | Target Coverage |
| :--- | :--- | :--- | :--- |
| **1. Domain Unit Tests** | **Vitest** | `src/lib/domain/**` (`entitlements.ts`, `calculations.ts`, `numbering.ts`, `status.ts`, `timezone.ts`) and Zod schemas (`src/lib/validations/**`) | **100% statement & branch coverage** (MUST) |
| **2. Database, RPC & API Integration Tests** | **Vitest** | Server Actions, Webhook handler, Cron handler, `issue_invoice` RPC, and RLS policies against local Supabase / mocked adapter | **All `API.md` contracts & error codes** (MUST) |
| **3. Component & PDF Rendering Tests** | **Vitest + React Testing Library + `@react-pdf/renderer`** | `WebPreview` and `PdfDocument` (`modern-minimalist` template), verifying `[DRAFT]`, `Inter` font registration, bilingual labels, and platform footer | **All template states** (MUST) |
| **4. End-to-End (E2E) Browser Tests** | **Playwright** | Critical user journeys across Desktop (`1280×800`) and Mobile (`390×844`) viewports (`NFR-1`) | **Core happy paths & paywall gates** (SHOULD) |

---

## 3. Mandatory Test Scenarios Matrix

### 3.1 Financial Calculation Tests (`src/lib/domain/__tests__/calculations.test.ts` — `NFR-4`, `D-44`, `D-45`)

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-CALC-01** | Multiple line items with decimal quantities (`1.5 × Rp10.000.000`) | Exact `line_total = 15000000`, no floating-point residue. |
| **TC-CALC-02** | Classic IEEE-754 trap (`0.1 + 0.2` in USD) | Exact `0.30` (`$0.30`), never `0.30000000000000004`. |
| **TC-CALC-03** | Percentage discount (`10%`) + Tax (`PPN 11%`, `D-44`) | `subtotal = 25,000,000` → `discount = 2,500,000` → `taxable = 22,500,000` → `tax = 2,475,000` → `grand_total = 24,975,000` (`FR-1.6`). |
| **TC-CALC-04** | Fixed discount (`D-45`) exceeding subtotal | `taxable_amount` clamps at `0.00` (never negative total). |
| **TC-CALC-05** | Currency formatting (`D-46`) | `IDR` → `Rp1.500.000`; `USD` → `$1,500.00`; `JPY` → `¥1,500`. |

---

### 3.2 Invoice Numbering & Sequence Tests (`D-13`, `D-18`, `D-30`, `D-42`, `D-54`–`D-56`)

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-NUM-01** | Draft creation & editing (`D-30`, `D-42`) | `invoice_number` remains `NULL` in DB; UI and PDF render literally `[DRAFT]` in both EN and ID; `invoice_sequences` is not incremented. |
| **TC-NUM-02** | Deleting a `Draft` invoice (`D-21`, `D-30`) | Next issued invoice still gets the consecutive number with **no gap**. |
| **TC-NUM-03** | Prefix change mid-year (`D-18`) | Issue #1 with `ACM` in Nov 2026 → `INV-ACM-2026-11-0001`. Change prefix to `ACME`, issue #2 in Dec 2026 → `INV-ACME-2026-12-0002` (does **not** restart at `0001`). |
| **TC-NUM-04** | Month change within same year (`D-13`) | Nov 2026 (`0001`) → Dec 2026 (`0002`). Month changes from `11` to `12`, sequence continues. |
| **TC-NUM-05** | New `issue_date` year reset (`D-13`, `D-56`) | Invoice with `issue_date` in Jan 2027 resets sequence for `2027` to `INV-ACME-2027-01-0001`, while a back-dated invoice with `issue_date` in Dec 2026 increments the `2026` counter (`INV-ACME-2026-12-0003`). |
| **TC-NUM-06** | Sequence overflow past `9999` (`A-05`) | 10,000th invoice in the same year formats as `INV-ACM-2026-12-10000` (5 digits). |
| **TC-NUM-07** | Prefix validation (`D-54`) | Accepts `AB`, `ACM`, `USR123` (`2–6` uppercase alphanumeric); rejects `A` (too short), `ABCDEFG` (too long), `AC-M` (hyphen), `acm` (normalized to uppercase). |
| **TC-NUM-08** | Concurrent issuance race condition (`FR-2.7`) | Calling `issue_invoice` concurrently on two drafts for the same user produces `-0001` and `-0002`, never duplicate numbers. |

---

### 3.3 Plan, Role & Entitlement Tests (`Free`, `Pro`, `Lapsed` — `D-11`, `D-12`, `D-21`–`D-33`, `D-40`)

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-ENT-01** | Visitor attempts to preview or create invoice (`D-24`, `D-31`) | Blocked by middleware/action (`UNAUTHENTICATED`), redirected to `/login`. |
| **TC-ENT-02** | Free user creates 3 drafts, then attempts a 4th (`D-12`) | First 3 succeed; 4th fails with `PLAN_LIMIT_REACHED`. |
| **TC-ENT-03** | Free user at `3/3` deletes 1 `Draft`, then creates a new invoice (`D-21`, `D-29`) | Delete succeeds (count drops to `2/3`); creating new invoice succeeds (`3/3`). |
| **TC-ENT-04** | Free user attempts to delete a `Sent`, `Overdue`, or `Paid` invoice (`D-29`) | Rejected with `DELETE_NOT_ALLOWED_ON_FREE` at both Server Action and RLS layers. |
| **TC-ENT-05** | Free user attempts Logo upload, Public Link creation, or Email send (`D-11`) | Rejected with `PRO_REQUIRED`. |
| **TC-ENT-06** | Lapsed user attempts to edit line items or delete an existing invoice (`D-23`, `D-28`) | Rejected with `LAPSED_READ_ONLY`. |
| **TC-ENT-07** | Lapsed user marks an existing `Sent` or `Overdue` invoice as `Paid` (`D-28`, `A-18`) | **Succeeds** (`status = 'paid'`, `paid_at` recorded). |
| **TC-ENT-08** | Lapsed user attempts to revert a `Paid` invoice back to `Sent` (`D-28`) | Rejected with `LAPSED_READ_ONLY`. |
| **TC-ENT-09** | Lapsed user with `2` saved invoices creates a 3rd invoice (`D-33`, `A-23`) | **Succeeds** (up to cap of 3), created without Pro logo and with platform footer; attempting a 4th fails with `PLAN_LIMIT_REACHED`. |
| **TC-ENT-10** | Logo & Public Link behavior when Pro user becomes Lapsed (`D-27`, `D-40`) | Existing invoices still render their saved `logo_url`; existing `/i/[token]` public links remain viewable by the client and now display the platform footer. |

---

### 3.4 Billing, Grace Period & Cron Reminder Tests (`D-16`, `D-22`, `D-26`, `D-52`, `D-53`)

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-BILL-01** | Manual payment before `current_period_end` (`A-14`) | Buying a 3-month plan (`Rp79.000`) when 10 days remain on a 1-month plan adds 3 months onto the existing `current_period_end`. |
| **TC-BILL-02** | Duplicate webhook delivery (same `gateway_event_id`) | Second call returns `200 OK` without extending `current_period_end` twice. |
| **TC-BILL-03** | Failed auto-renewal charge (`D-52`) | Subscription moves to `past_due` with `grace_period_end = now + 3 days`; user retains `pro` access during the 3-day window; transitions to `lapsed` after day 3 if still unpaid. |
| **TC-BILL-04** | Expiry reminders on 1-month manual plan (`D-26`, `A-21`, `D-53`) | 30-day reminder is skipped at purchase; reminders fire at `14d`, `3d`, and `0d` (WIB) exactly once each. |
| **TC-BILL-05** | Auto-renewal reminder (`D-53`) | Auto-renew subscription receives only the `auto_renew_3d` notice 3 days before charge (no 30d/14d/0d manual expiry reminders). |

---

### 3.5 Security & Rate-Limit Tests (`D-57`, `SECURITY.md`)

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-SEC-01** | Cross-tenant IDOR attempt (`NFR-2`) | User A calling `saveInvoiceDraftAction`, `deleteInvoiceAction`, or `GET /api/invoices/[userB_invoice_id]/pdf` receives `NOT_FOUND` / `403`. |
| **TC-SEC-02** | SVG or fake-PNG upload (`A-06`, `SEC-5`) | Uploading an `.svg` file or an `.html` file renamed to `.png` is rejected by magic-byte inspection. |
| **TC-SEC-03** | Pro email rate limit (`D-57`) | 6th email for the same `invoice_id` on the same WIB date returns `RATE_LIMIT_EXCEEDED`; 51st email across the account on the same WIB date returns `RATE_LIMIT_EXCEEDED`. |

---

## 4. Assumptions & Open Questions

### 4.1 Assumptions
| ID | Assumption |
| :--- | :--- |
| **TEST-A01** | Unit and integration tests run offline in CI using Vitest (`npm test`) without requiring live credentials for Xendit/Midtrans/Mayar or Resend (using deterministic mock adapters). |

### 4.2 Open Questions
No unresolved testing questions remain.

---

## 5. Change history

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0.0 | 2026-10-27 | Initial testing specification mapping `D-01`–`D-58` to automated test cases. |
