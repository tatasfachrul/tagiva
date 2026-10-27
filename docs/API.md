# API — Server Actions, Route Handlers & Webhook Contracts

| Field | Value |
| :--- | :--- |
| Product name | **Tagiva** (`tagiva.com`, see `PRD.md` `D-59`) |
| Document status | **Approved** |
| Version | 1.0.0 |
| Last updated | 2026-10-27 |
| Depends on | `PRD.md` (v1.0.0), `DESIGN_SYSTEM.md` (v1.1.0), `UX_FLOWS.md` (v1.1.0), `ARCHITECTURE.md` (v1.1.0), `DATABASE.md` (v1.1.0) |

---

## 0. Purpose of this document

This document specifies the **complete backend interface** of the application: **Next.js Server Actions** (for authenticated UI mutations) and **HTTP Route Handlers** (for binary PDF streams, public client links, payment gateway webhooks, and Vercel Cron jobs).

Its goals are:
1. Define exact input schemas (`Zod`), output payloads, and deterministic error codes so frontend components and backend handlers agree on every contract.
2. Specify the exact server-side entitlement checks (`NFR-6`) and rate limits (`D-57`) executed before any database mutation or external API call.

How to read requirement keywords:
- **MUST**: required for MVP launch.
- **SHOULD**: expected for MVP. Can only be dropped with an explicit decision.

---

## 1. Reused decisions from prior documents

| Decision ID | Summary | API Contract Impact |
| :--- | :--- | :--- |
| **D-04, D-11, D-12, D-21, D-23, D-28, D-29, D-33** | Role & plan matrix (`Free`, `Pro`, `Lapsed`); 3-slot cap; `Draft`-only delete on Free; Lapsed read-only except `Sent`/`Overdue` → `Paid`. | Every mutation returns standardized error codes (`PLAN_LIMIT_REACHED`, `PRO_REQUIRED`, `LAPSED_READ_ONLY`, `DELETE_NOT_ALLOWED_ON_FREE`). |
| **D-13, D-18, D-30, D-54, D-55, D-56** | `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`; `PREFIX` is `^[A-Z0-9]{2,6}$`; 100% system-generated when leaving `Draft`. | `saveInvoiceDraftAction` never accepts an `invoiceNumber` from the client; `issueInvoiceAction` calls the `issue_invoice` Postgres RPC. |
| **D-16, D-22, D-48, D-52** | Plans `1m / 3m / 6m / 12m`; `manual` & `auto_renew`; Payment Gateway Adapter; 3-day grace period. | `createSubscriptionCheckoutAction` and `POST /api/webhooks/billing` use the `PaymentGatewayAdapter` contract. |
| **D-40, D-43, D-49** | `@react-pdf/renderer` with `Inter` font; public links stay active with platform footer when Lapsed. | `GET /api/invoices/[id]/pdf` and `GET /api/public/i/[token]/pdf` stream `application/pdf` with conditional footer. |
| **D-51, D-57** | Email sender `"[Business Name] via Tagiva"`; rate limit **50 emails/day/account** and **5 emails/day/invoice**. | `sendInvoiceEmailAction` enforces rate limits against `invoice_email_logs` before calling Resend. |
| **D-58** | Account deletion handled manually via support email for MVP. | No self-serve destructive account deletion endpoint in MVP; Settings links to support email. |

---

## 2. Standard Response & Error Envelope

### 2.1 Server Action Result Envelope
All Next.js Server Actions **MUST** return a discriminated union (never throwing unhandled exceptions to the client UI):

```typescript
export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: ApiErrorCode;
        message: string; // Localized to active UI language (EN / ID)
        fieldErrors?: Record<string, string[]>;
      };
    };
```

### 2.2 Canonical Error Codes (`ApiErrorCode`)

| Error Code | HTTP Equivalent | When Returned |
| :--- | :---: | :--- |
| `UNAUTHENTICATED` | `401` | User has no valid Supabase session (`D-24`, `D-31`). |
| `NOT_FOUND` | `404` | Invoice, client, or public token does not exist or does not belong to `auth.uid()`. |
| `VALIDATION_ERROR` | `422` | Zod input validation failed (`fieldErrors` populated). |
| `PLAN_LIMIT_REACHED` | `403` | `Free` or `Lapsed` user already has `>= 3` saved invoices (`D-12`, `D-33`). |
| `PRO_REQUIRED` | `403` | Non-Pro user attempted a Pro-only action (Logo upload, Public Link creation, Email send, `D-11`). |
| `LAPSED_READ_ONLY` | `403` | `Lapsed` user attempted to edit or delete an existing invoice, or attempted a status change other than `Sent`/`Overdue` → `Paid` (`D-23`, `D-28`). |
| `DELETE_NOT_ALLOWED_ON_FREE` | `403` | `Free` user attempted to delete a `Sent`, `Overdue`, or `Paid` invoice (`D-29`). |
| `INVALID_STATUS_TRANSITION` | `409` | Attempted to revert an issued invoice back to `Draft` (`A-16`). |
| `RATE_LIMIT_EXCEEDED` | `429` | Pro user exceeded **50 emails/day** across their account or **5 emails/day** for a single invoice (`D-57`). |
| `INTERNAL_ERROR` | `500` | Unexpected database, PDF rendering, or external service failure. |

---

## 3. Authenticated Server Actions (`src/app/(app)/**/actions.ts`)

### 3.1 Profile & Onboarding Actions

#### `updateBusinessProfileAction(input)`
Updates the user's business profile (`profiles` table) during `/onboarding` (`D-38`) or `/settings`.

- **Input Schema (`Zod`):**
  ```typescript
  const UpdateBusinessProfileSchema = z.object({
    businessName: z.string().trim().min(1).max(120),
    email: z.string().trim().email().or(z.literal('')),
    phone: z.string().trim().max(40).default(''),
    address: z.string().trim().max(500).default(''),
    taxId: z.string().trim().max(60).default(''),
    invoicePrefix: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,6}$/), // D-54
    defaultCurrency: z.enum(['IDR', 'USD', 'SGD', 'EUR', 'AUD', 'GBP', 'MYR', 'JPY']), // D-32, D-46
    defaultLanguage: z.enum(['en', 'id']), // D-25
    bankDetails: z.object({
      bankName: z.string().trim().max(80).default(''),
      accountNumber: z.string().trim().max(60).default(''),
      accountHolder: z.string().trim().max(120).default(''),
      notes: z.string().trim().max(500).default(''),
    }),
  });
  ```
- **Authorization Rules:**
  - Allowed for `Free`, `Pro`, and `Lapsed` (`D-39`, `A-19`).
  - Sets `onboarding_completed = true`.

#### `uploadBusinessLogoAction(formData)` & `removeBusinessLogoAction()`
- **Input:** `FormData` with field `file` (`image/png`, `image/jpeg`, `image/webp`, max `2 MB`, `A-06`).
- **Authorization Rules:**
  - **MUST** verify `get_user_plan_state(auth.uid()) === 'pro'` (`D-04`, `D-11`). Returns `PRO_REQUIRED` otherwise.
- **Behavior:**
  - Uploads to Supabase Storage bucket `business-logos` at `{user_id}/logo-{timestamp}.{ext}`, updates `profiles.logo_url`, and returns `{ logoUrl }`.

---

### 3.2 Invoice Lifecycle Actions

#### `saveInvoiceDraftAction(input)`
Creates a new invoice (`status = 'draft'`, `invoice_number = NULL`, `D-30`) or updates an existing editable invoice (`Draft` or `Sent`/`Paid` on `Free`/`Pro`, `A-04`).

- **Input Schema (`Zod`):**
  ```typescript
  const SaveInvoiceSchema = z.object({
    id: z.string().uuid().optional(), // Omit to create new draft; provide to update existing
    customerId: z.string().uuid().nullable().optional(),
    saveCustomerToDirectory: z.boolean().default(false), // UX-A02
    language: z.enum(['en', 'id']), // D-17
    currency: z.enum(['IDR', 'USD', 'SGD', 'EUR', 'AUD', 'GBP', 'MYR', 'JPY']), // D-46
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sender: z.object({
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email().or(z.literal('')),
      phone: z.string().trim().max(40).default(''),
      address: z.string().trim().max(500).default(''),
      taxId: z.string().trim().max(60).default(''),
      paymentInstructions: z.record(z.string(), z.string()),
    }),
    client: z.object({
      name: z.string().trim().min(1).max(120),
      company: z.string().trim().max(120).default(''),
      email: z.string().trim().email().or(z.literal('')),
      address: z.string().trim().max(500).default(''),
    }),
    items: z.array(
      z.object({
        description: z.string().trim().min(1).max(500),
        quantity: z.number().positive().max(99999999),
        unitPrice: z.number().min(0).max(999999999999),
      })
    ).min(1).max(100),
    discountType: z.enum(['percent', 'fixed']), // D-45
    discountValue: z.number().min(0),
    taxLabel: z.string().trim().max(30).default('PPN'), // D-44
    taxRate: z.number().min(0).max(100).default(0),
    notes: z.string().trim().max(1000).default(''),
  });
  ```
- **Server-Side Rules:**
  1. ** never trusts client-calculated totals:** Server recalculates `line_total`, `subtotal`, `discount_amount`, `tax_amount`, and `total_amount` using `MoneyCalculator` (`NFR-4`).
  2. ** never accepts an invoice number from the client (`D-55`).**
  3. **If creating (`!input.id`):**
     - Checks `canCreateInvoice(planState, count)` (`D-12`, `D-33`). If `Free` or `Lapsed` has `>= 3` invoices, returns `PLAN_LIMIT_REACHED`.
     - If `planState === 'pro'`, snapshots `profiles.logo_url` into `invoices.logo_url`; if `free` or `lapsed`, sets `invoices.logo_url = NULL` (`D-27`, `A-23`).
  4. **If updating (`input.id`):**
     - If `planState === 'lapsed'`, returns `LAPSED_READ_ONLY` (`D-23`, `D-28`).

#### `issueInvoiceAction({ invoiceId })`
Transitions a `Draft` invoice to `Sent` and assigns its permanent `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]` number (`D-13`, `D-30`, `D-55`, `D-56`).
- **Authorization Rules:** Allowed for `Free` and `Pro` (and for a newly created draft by a `Lapsed` user with `< 3` total invoices, `D-33`).
- **Implementation:** Calls `supabase.rpc('issue_invoice', { p_invoice_id: invoiceId })`.
- **Output:** `{ invoiceId: string; invoiceNumber: string; status: 'sent'; issuedAt: string }`.

#### `updateInvoiceStatusAction({ invoiceId, targetStatus })`
- **Input:** `{ invoiceId: UUID, targetStatus: 'sent' | 'paid' }` (Note: `'draft'` is rejected with `INVALID_STATUS_TRANSITION`, `A-16`).
- **Authorization Rules:**
  - `Lapsed`: **ONLY** allowed when current effective status is `'sent'` or `'overdue'` and `targetStatus === 'paid'` (`D-28`, `A-18`). Otherwise returns `LAPSED_READ_ONLY`.
  - `Free` & `Pro`: allowed for `'sent' <-> 'paid'`.

#### `deleteInvoiceAction({ invoiceId })`
- **Authorization Rules (`D-21`, `D-28`, `D-29`):**
  - `Lapsed`: returns `LAPSED_READ_ONLY`.
  - `Free`: if `invoice.status !== 'draft'`, returns `DELETE_NOT_ALLOWED_ON_FREE`. If `status === 'draft'`, hard-deletes the row and restores 1 Free slot (`D-21`).
  - `Pro`: hard-deletes the row (`A-12`).

---

### 3.3 Pro Sharing & Email Delivery Actions (`FR-8`, `FR-9`)

#### `createOrTogglePublicLinkAction({ invoiceId, enabled })`
- **Authorization Rules:** Requires `planState === 'pro'` (`D-11`). Returns `PRO_REQUIRED` otherwise.
- **Behavior:**
  1. If `invoice.status === 'draft'` and `enabled === true`, first executes `issue_invoice(invoiceId)` so the shared invoice has a permanent number (`FR-8.1`).
  2. If `invoice.public_token` is `NULL`, generates a 24-character URL-safe cryptographic token (`nanoid(24)`).
  3. Sets `public_link_enabled = enabled` and returns `{ publicUrl: 'https://tagiva.com/i/' + public_token, enabled }`.

#### `sendInvoiceEmailAction(input)`
- **Input Schema (`Zod`):**
  ```typescript
  const SendInvoiceEmailSchema = z.object({
    invoiceId: z.string().uuid(),
    recipientEmail: z.string().trim().email(),
    subject: z.string().trim().min(1).max(160),
    message: z.string().trim().max(1000),
  });
  ```
- **Authorization & Rate-Limit Rules (`D-11`, `D-57`):**
  1. Requires `planState === 'pro'`. Returns `PRO_REQUIRED` otherwise.
  2. Queries `invoice_email_logs` for today's WIB date (`(NOW() AT TIME ZONE 'Asia/Jakarta')::date`):
     - If count for `user_id >= 50`, returns `RATE_LIMIT_EXCEEDED` (*"Daily limit of 50 invoice emails reached"*).
     - If count for `invoice_id >= 5`, returns `RATE_LIMIT_EXCEEDED` (*"This invoice has already been emailed 5 times today"*).
- **Behavior:**
  1. If `invoice.status === 'draft'`, calls `issue_invoice(invoiceId)` (`FR-9.6`).
  2. Ensures `public_token` exists and `public_link_enabled = true` (`FR-9.3`).
  3. Renders the A4 PDF buffer in memory using `@react-pdf/renderer` (`D-49`).
  4. Sends email via Resend (`from: "${senderName} via Tagiva <invoices@tagiva.com>"`, `replyTo: senderEmail`, `D-51`) with the PDF attached.
  5. Inserts a row in `invoice_email_logs` and updates `invoices.sent_at = NOW()`.

---

### 3.4 Subscription & Billing Actions (`FR-10`)

#### `createSubscriptionCheckoutAction({ durationMonths, billingMode })`
- **Input:** `{ durationMonths: 1 | 3 | 6 | 12, billingMode: 'manual' | 'auto_renew' }` (`D-16`, `D-22`).
- **Behavior:**
  - Maps `durationMonths` to canonical IDR price (`1 -> 29000`, `3 -> 79000`, `6 -> 150000`, `12 -> 250000`, `D-16`).
  - Calls `paymentGatewayAdapter.createCheckout(...)` (`D-48`).
  - Returns `{ checkoutUrl }`.

#### `cancelAutoRenewAction({ subscriptionId })`
- Calls `paymentGatewayAdapter.cancelAutoRenew(...)`, updates `subscriptions.billing_mode = 'manual'` (or `status = 'cancelled'`), while keeping `current_period_end` active until the paid period ends (`FR-10.6`).

---

## 4. HTTP Route Handlers (`src/app/api/**/route.ts`)

### 4.1 `GET /api/invoices/[id]/pdf` (Authenticated PDF Download)
- **Authentication:** Requires valid Supabase user session owning `invoices.id`.
- **Footer Rule (`FR-7.3`, `D-28`):**
  - Evaluates `planState = get_user_plan_state(auth.uid())`.
  - `showFooter = (planState !== 'pro')`.
- **Response:**
  - `200 OK`
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="${invoice.invoice_number ?? 'DRAFT-Invoice'}.pdf"`

### 4.2 `GET /api/public/i/[token]/pdf` (Public Client PDF Download — `FR-8.2`, `D-40`)
- **Authentication:** Public (no login required; authorized by unguessable `token` where `public_link_enabled = true`).
- **Footer Rule (`D-40`):**
  - Checks the **invoice owner's** current `planState`.
  - If owner is `pro`, `showFooter = false`; if owner is `lapsed` (or `free`), `showFooter = true`.
- **Response:** Streams `application/pdf`. Returns `404` if token is invalid or revoked.

### 4.3 `POST /api/webhooks/billing` (Payment Gateway Webhook — `D-10`, `D-48`, `D-52`)
- **Authentication:** Verifies cryptographic webhook signature / callback token header from the configured Indonesian gateway (`Xendit`, `Midtrans`, or `Mayar`). Rejects invalid signatures with `401 Unauthorized`.
- **Idempotency:** Checks `billing_events.gateway_event_id`. If already processed, returns `200 OK` immediately.
- **State Transitions:**
  - **`status === 'paid'`:**
    - If the user has an active subscription with `current_period_end > NOW()`, extends `current_period_end = current_period_end + INTERVAL '[duration] months'` (`A-14`).
    - Otherwise sets `current_period_start = NOW()`, `current_period_end = NOW() + INTERVAL '[duration] months'`, `status = 'active'`, `grace_period_end = NULL`.
  - **`status === 'failed'` (on `auto_renew` charge):**
    - Sets `status = 'past_due'` and `grace_period_end = NOW() + INTERVAL '3 days'` (`D-52`), and dispatches a payment failure warning email.

### 4.4 `GET /api/cron/daily` (Vercel Cron — `D-26`, `D-50`, `D-52`, `D-53`)
- **Schedule:** `0 1 * * *` (`01:00 UTC` = `08:00 WIB` daily).
- **Authentication:** Verifies `Authorization: Bearer ${process.env.CRON_SECRET}`.
- **Tasks Executed:**
  1. **Expire Elapsed Subscriptions:** Updates `subscriptions` where `(status IN ('active', 'cancelled') AND current_period_end <= NOW())` or `(status = 'past_due' AND grace_period_end <= NOW())` to `status = 'expired'` (`D-23`, `D-52`).
  2. **Mark Overdue Invoices:** Updates `invoices` where `status = 'sent' AND due_date < (NOW() AT TIME ZONE 'Asia/Jakarta')::date` to `status = 'overdue'` (`D-15`).
  3. **Send Expiry & Renewal Reminders (`D-26`, `D-53`):**
     - For `billing_mode = 'manual'` subscriptions expiring in exactly `30`, `14`, `3`, or `0` days (WIB), sends reminder email and logs to `subscription_reminders`.
     - For `billing_mode = 'auto_renew'` subscriptions renewing in exactly `3` days (WIB), sends the 3-day upcoming charge notice and logs to `subscription_reminders`.

---

## 5. Assumptions in this document

| ID | Assumption |
| :--- | :--- |
| **API-A01** | Public PDF downloads (`/api/public/i/[token]/pdf`) are rate-limited by IP (max 30 downloads per minute per IP) at the middleware/route layer to prevent automated scraping or denial-of-wallet attacks on serverless compute. |
| **API-A02** | All monetary values in Server Action payloads are validated as finite numbers with at most 2 decimal places (`multipleOf(0.01)`). |

---

## 6. Open questions in this document

All API questions (`Q-15`, `Q-17`) have been resolved as `D-57` and `D-58`. No unresolved API questions remain.

---

## 7. Change history

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0.0 | 2026-10-27 | Initial API specification aligned with `PRD.md` (`D-01`–`D-58`), `ARCHITECTURE.md`, and `DATABASE.md`. |
