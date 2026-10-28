<p align="center">
  <img src="public/logo.png" alt="Tagiva Logo" width="80" height="80" />
</p>

<h1 align="center">Tagiva</h1>

<p align="center">
  <strong>Modern invoicing for Indonesian freelancers and small businesses.</strong><br />
  Create, manage, and send professional A4 invoices with PDF generation, shareable client links, and automated numbering.
</p>

---

## Overview

**Tagiva** (`tagiva.com`) is a bilingual (`EN | ID`) invoicing SaaS designed for the Indonesian market. It enables freelancers and small businesses to sign in with Google, configure their business profile and bank transfer details, and generate clean, print-ready invoices in minutes without spreadsheets or complex accounting software.

### Key Features

- **Google OAuth Sign-In (`D-14`)**: Frictionless authentication via Supabase Auth PKCE with a 1-step Business Setup onboarding flow.
- **Live Split-Screen Invoice Builder**: Real-time A4 invoice preview (`Inter` typography with `tabular-nums`) paired with server-side PDF rendering via `@react-pdf/renderer`.
- **Smart Invoice Numbering (`D-13`, `D-30`, `D-56`)**:
  - Drafts always display `[DRAFT]` with `NULL` database sequence numbers.
  - Issuing an invoice atomically assigns `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]` via a PostgreSQL RPC, keyed per `(user_id, issue_date year)`.
- **Exact Financial Calculations (`D-44`, `D-45`, `NFR-4`)**:
  - Multi-currency support (`IDR` default, `USD`, `SGD`, `EUR`, `AUD`, `GBP`, `MYR`, `JPY`).
  - Percentage or fixed-amount discounts and customizable tax rates with a 1-click **PPN 11%** preset.
- **Multi-Channel Delivery (`D-05`)**:
  - Instant server-rendered PDF downloads.
  - Public read-only client links (`/i/[token]`) with localized status badges (`Unpaid` / `Paid` / `Overdue`).
  - Direct email delivery with PDF attachments via Resend (`[Business Name] via Tagiva`).
- **Freemium & Local Subscription Billing (`D-10`, `D-16`, `D-22`, `D-48`)**:
  - **Free tier**: Up to 3 saved invoices in total, custom prefix, and PDF downloads with platform attribution.
  - **Pro tier**: Unlimited invoices, custom business logo upload (magic-byte validated), no watermark, public shareable links, and email delivery.
  - **Pluggable Indonesian Payment Gateway Adapter**: Supports Xendit, Midtrans, and Mayar across `1m` (Rp29.000), `3m` (Rp79.000), `6m` (Rp150.000), and `12m` (Rp250.000) plans in both manual and auto-renew modes.
- **WIB Timezone Engine (`NFR-5`)**: All date evaluations, overdue transitions, and daily Vercel Cron reminders (`30d`, `14d`, `3d`, `0d`) operate in `Asia/Jakarta` (`UTC+07:00`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI), [Lucide Icons](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Google OAuth, Storage) |
| **PDF Engine** | [`@react-pdf/renderer`](https://react-pdf.org/) (Server-side Node.js runtime with bundled `Inter` `.ttf` fonts) |
| **Email** | [Resend](https://resend.com/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/) (Unit & Integration) + [Playwright](https://playwright.dev/) (End-to-End) |
| **Deployment** | [Vercel](https://vercel.com/) (Serverless Functions + Vercel Cron) |

---

## Architecture & Directory Structure

Tagiva enforces a strict **Feature-First Architecture** (`src/app/` + `src/features/` split):

- **`src/app/` (Routing Only)**: Next.js route files are thin re-exports of their corresponding feature modules (`export { <Feature>Page as default, <feature>Metadata as metadata } from '@/features/<feature>'`) plus API Route Handlers (`/api/**`).
- **`src/features/<feature>/` (Feature Modules)**: Owns `page.tsx`, `metadata.ts`, `actions.ts`, `queries/`, `hooks/`, `components/`, `config/`, `types/`, and barrel `index.ts`.
- **`src/lib/domain/` (Pure Domain Layer)**: Framework-agnostic, 100% unit-tested business logic for entitlements (`entitlements.ts`), money math (`calculations.ts`), numbering (`numbering.ts`), status transitions (`status.ts`), and `Asia/Jakarta` dates (`timezone.ts`).

```text
/
├── docs/                           # Source-of-truth specifications (PRD, Architecture, DB, API, Security)
├── public/
│   ├── logo.png                    # Official Tagiva brand logo
│   └── fonts/inter/                # Static Inter .ttf fonts for @react-pdf/renderer
├── supabase/
│   └── migrations/                 # PostgreSQL schema, RLS policies, and atomic RPCs
├── src/
│   ├── app/                        # Next.js App Router (thin route re-exports & API routes)
│   │   ├── (marketing)/            # /, /pricing, /terms, /privacy
│   │   ├── (auth)/                 # /login, /auth/callback
│   │   ├── (app)/                  # /onboarding, /dashboard, /invoices/*, /clients, /settings/*
│   │   ├── (public-invoice)/       # /i/[token]
│   │   └── api/                    # PDF endpoints, payment webhooks, and daily cron
│   ├── features/                   # Self-contained feature modules
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── public-invoice/
│   │   ├── clients/
│   │   ├── settings/
│   │   ├── landing/
│   │   ├── pricing/
│   │   └── legal/
│   ├── components/                 # Shared UI primitives, app layout, and A4 invoice templates
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── layout/                 # Header, sidebar, banners, slot counter
│   │   └── invoice-templates/      # Paired web-preview.tsx & pdf-document.tsx
│   └── lib/
│       ├── domain/                 # Pure domain services (entitlements, calculations, numbering, timezone, status)
│       ├── billing/                # PaymentGatewayAdapter (Xendit, Midtrans, Mayar)
│       ├── email/                  # Resend client & localized email templates
│       ├── pdf/                    # Server-side PDF renderer & font registry
│       ├── security/               # Magic-byte validator, token generator, rate limiter
│       ├── supabase/               # Browser, Server, Middleware, and Service-Role clients
│       ├── validations/            # Shared Zod schemas
│       └── i18n/                   # EN / ID UI & invoice dictionaries
└── tests/
    ├── unit/                       # Domain & security unit tests (Vitest)
    ├── integration/                # RPC, webhook, and entitlement integration tests (Vitest)
    └── e2e/                        # Playwright browser E2E suite
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v24.22.1` (or compatible Node 20+ LTS)
- **npm**: `v10+`
- A **Supabase** project (cloud or local via Supabase CLI)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public | Canonical base URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key (protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Supabase service role key (used only in webhooks & cron) |
| `RESEND_API_KEY` | Server-only | Resend API key (use `mock` in local dev for mock fallback) |
| `PAYMENT_GATEWAY_PROVIDER` | Server-only | Active gateway adapter: `xendit` \| `midtrans` \| `mayar` |
| `PAYMENT_GATEWAY_SECRET_KEY` | Server-only | Gateway secret key (use `mock` in local dev) |
| `PAYMENT_GATEWAY_WEBHOOK_SECRET` | Server-only | Webhook signature verification secret |
| `CRON_SECRET` | Server-only | Bearer token for authenticating `GET /api/cron/daily` |

### 3. Apply Database Migrations

Apply the SQL migrations located in `supabase/migrations/` to your Supabase PostgreSQL instance:

1. `20261027000001_initial_schema.sql` — Tables (`profiles`, `clients`, `invoices`, `invoice_items`, `invoice_sequences`, `subscriptions`, `subscription_Notifications`, `email_send_logs`), constraints, indexes, and triggers.
2. `20261027000002_rpc_functions.sql` — Atomic `issue_invoice`, `get_user_plan_state`, `recalculate_invoice_totals`, and `get_public_invoice_by_token` RPCs.
3. `20261027000003_rls_and_storage.sql` — Row-Level Security policies and `business-logos` storage bucket rules.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Next.js development server on port `3000` |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run typecheck` | Run TypeScript compiler type checking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint across the repository |
| `npm test` | Run all Vitest unit and integration test suites |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run test:e2e` | Run Playwright end-to-end tests |

---

## Documentation Map

All product decisions, architecture rules, and database contracts are documented in [`docs/`](docs/):

1. **[`docs/PRD.md`](docs/PRD.md)** — Master Decision Log (`D-01`–`D-60`), roles (`Visitor`, `Free`, `Pro`, `Lapsed`), pricing, and product scope.
2. **[`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)** — Color tokens, typography (`Plus Jakarta Sans` UI + `Inter` invoice/PDF), and A4 template specifications.
3. **[`docs/UX_FLOWS.md`](docs/UX_FLOWS.md)** — Route inventory, onboarding flow, status transitions, and Lapsed read-only screens.
4. **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** — System architecture, domain services, `PaymentGatewayAdapter`, PDF engine, and cron jobs.
5. **[`docs/DATABASE.md`](docs/DATABASE.md)** — PostgreSQL schema, `CHECK` constraints, atomic RPC functions, and RLS policies.
6. **[`docs/API.md`](docs/API.md)** — Server Action contracts, `ActionResult<T>` envelope, error codes, and rate limits.
7. **[`docs/SECURITY.md`](docs/SECURITY.md)** — Google OAuth PKCE, RLS defense-in-depth, magic-byte validation, and UU PDP compliance.
8. **[`docs/CODE_STYLE.md`](docs/CODE_STYLE.md)** — TypeScript conventions, Server/Client component boundaries, and WIB timezone rules.
9. **[`docs/TESTING.md`](docs/TESTING.md)** — Mandatory unit, integration, and E2E test specifications.
10. **[`docs/AGENTS.md`](docs/AGENTS.md)** — Operating manual and guardrails for AI coding agents.
