# SECURITY — Authentication, Data Protection, Abuse Prevention & UU PDP Compliance

| Field | Value |
| :--- | :--- |
| Product name | **Tagiva** (`tagiva.com`, see `PRD.md` `D-59`) |
| Document status | **Approved** |
| Version | 1.0.0 |
| Last updated | 2026-10-27 |
| Depends on | `PRD.md` (v1.0.0), `ARCHITECTURE.md` (v1.1.0), `DATABASE.md` (v1.1.0), `API.md` (v1.0.0) |

---

## 0. Purpose of this document

This document defines the **security controls**, **access isolation**, **file and webhook validation**, **rate limiting**, and **Indonesian Personal Data Protection Law (UU PDP No. 27/2022) compliance** for the platform.

Its goals are:
1. Guarantee strict tenant isolation so User A can never read, edit, or delete User B's invoices, clients, or business profile (`NFR-2`).
2. Prevent plan-limit bypasses, stored XSS, webhook forgery, and email spam (`NFR-6`, `D-57`).
3. Ensure personal data handling complies with Indonesia's UU PDP (`NFR-3`, `D-58`).

How to read requirement keywords:
- **MUST**: required for MVP launch.
- **SHOULD**: expected for MVP. Can only be dropped with an explicit decision.

---

## 1. Reused decisions from prior documents

| Decision ID | Summary | Security Impact |
| :--- | :--- | :--- |
| **D-14, D-24, D-31** | **Google sign-in only**; no invoice creation or preview before signing in; no guest device/IP tracking. | Eliminates password credential stuffing and removes the need for invasive guest device fingerprinting. |
| **D-11, D-12, D-23, D-28, D-29, D-33, NFR-6** | Plan & role restrictions (`Free`, `Pro`, `Lapsed`) enforced on the server. | Enforced twice: in TypeScript (`EntitlementService`) and in PostgreSQL Row Level Security (RLS). |
| **D-40, FR-8.2, FR-8.4** | Public invoice links (`/i/[token]`) use unguessable tokens and can be revoked. | 24-char cryptographic token (`>= 144 bits` entropy), `X-Robots-Tag: noindex, nofollow`, and `SECURITY DEFINER` scoped lookup. |
| **D-57** | Email rate limit: **max 50 emails/day/account** and **max 5 emails/day/invoice**. | Enforced on the server via `invoice_email_logs` before calling Resend. |
| **D-58, NFR-3** | Account deletion requests under **UU PDP** are handled manually via support email for the MVP. | Documented manual deletion SOP and data retention rules in Section 7. |
| **A-06** | Logo upload allows **PNG, JPG, WEBP only** (max 2 MB); **SVG is excluded**. | Blocks SVG-based Stored XSS and SSRF/XXE in the PDF renderer. |

---

## 2. Authentication & Session Security (`D-14`, `D-24`, `D-31`)

| ID | Control | Level |
| :--- | :--- | :--- |
| **SEC-AUTH-1** | **Google OAuth 2.0 (PKCE flow):** Authentication is delegated exclusively to Google via Supabase Auth (`signInWithOAuth({ provider: 'google' })`) using PKCE code exchange at `/auth/callback`. | MUST |
| **SEC-AUTH-2** | **HTTP-Only Secure Cookies:** Session tokens **MUST** be stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies managed by `@supabase/ssr`, never exposed to `localStorage` where third-party scripts could read them. | MUST |
| **SEC-AUTH-3** | **Server-Verified Identity:** Server Actions and Route Handlers **MUST** call `supabase.auth.getUser()` (which verifies the JWT with Supabase Auth) rather than trusting `getSession()` from unverified cookie data. | MUST |
| **SEC-AUTH-4** | **Open Redirect Prevention:** The `/auth/callback?next=...` parameter **MUST** be validated to ensure it starts with a single `/` and not `//` or an external URL before redirecting. | MUST |

---

## 3. Authorization & Multi-Tenant Data Isolation (`NFR-2`, `NFR-6`)

We enforce a **two-layer defense-in-depth** model:

1. **Layer 1 — Application Domain Guard (`EntitlementService`):**
   - Every Server Action validates ownership (`invoice.user_id === user.id`) and plan entitlements (`Free`, `Pro`, `Lapsed`) before constructing any database query.
2. **Layer 2 — PostgreSQL Row Level Security (RLS):**
   - Authenticated requests use the per-request user-scoped Supabase client (`src/lib/supabase/server.ts`), so PostgreSQL RLS policies (`DATABASE.md` Section 5) automatically block cross-tenant access, over-cap inserts (`>= 3` on Free/Lapsed), non-draft deletes on Free (`D-29`), and unauthorized Lapsed updates (`D-28`).
3. **Service-Role Key Restriction (`SUPABASE_SERVICE_ROLE_KEY`):**
   - The Supabase Service Role client (`src/lib/supabase/admin.ts`) bypasses RLS and **MUST ONLY** be imported in:
     - `src/app/api/webhooks/billing/route.ts` (after webhook signature verification)
     - `src/app/api/cron/daily/route.ts` (after `CRON_SECRET` verification)
   - It **MUST NEVER** be imported in client components, standard user Server Actions, or exposed via `NEXT_PUBLIC_*` environment variables.

---

## 4. Public Shareable Invoice Link Security (`/i/[token]` — `FR-8`)

| ID | Control | Level |
| :--- | :--- | :--- |
| **SEC-PUB-1** | **Cryptographic Token Entropy:** `public_token` **MUST** be generated on the server using `crypto.randomBytes` or `nanoid(24)` (`>= 144 bits` of entropy), making brute-force enumeration infeasible. | MUST |
| **SEC-PUB-2** | **Scoped Database Lookup:** Public invoice pages and `/api/public/i/[token]/pdf` **MUST** query via the `get_public_invoice_by_token(p_token)` RPC, which returns **only** the single matching invoice when `public_link_enabled = TRUE` and never exposes the user's other invoices, customer list, or subscription metadata. | MUST |
| **SEC-PUB-3** | **Search Engine Exclusion:** Both `/i/[token]` and `/api/public/i/[token]/pdf` **MUST** return `X-Robots-Tag: noindex, nofollow, noarchive` and `<meta name="robots" content="noindex, nofollow" />` so private client invoices are never indexed by search engines. | MUST |
| **SEC-PUB-4** | **Instant Revocation (`FR-8.4`):** Setting `public_link_enabled = FALSE` immediately causes `/i/[token]` and its PDF endpoint to return `404 Not Found`. | MUST |

---

## 5. File Upload & PDF Rendering Security (`FR-6`, `A-06`, `D-49`)

1. **Strict MIME & Magic-Byte Validation (`A-06`):**
   - Allowed logo formats: `image/png`, `image/jpeg`, `image/webp`.
   - **SVG (`image/svg+xml`) is strictly forbidden** because SVG files can contain embedded `<script>` tags (Stored XSS) and external entity references (XXE/SSRF).
   - `uploadBusinessLogoAction` **MUST** inspect the file buffer's magic bytes (file signature: `89 50 4E 47` for PNG, `FF D8 FF` for JPEG, `52 49 46 46 ... 57 45 42 50` for WEBP), not just the client-supplied `Content-Type` or file extension.
2. **File Size & Path Isolation:**
   - Maximum size: `2 MB` (`2,097,152` bytes) enforced in both the Server Action and the Supabase Storage bucket policy.
   - Files are stored under `{auth.uid()}/logo-{random}.{ext}` so users cannot overwrite another user's logo.
3. **SSRF Prevention in PDF Engine (`D-49`):**
   - When `@react-pdf/renderer` fetches `invoice.logo_url`, the URL **MUST** be validated to match the project's own Supabase Storage hostname (`https://[project-ref].supabase.co/storage/v1/object/public/business-logos/...`). Arbitrary external image URLs are never fetched by the server PDF renderer.

---

## 6. Webhook, Cron & Email Abuse Prevention (`D-48`, `D-50`, `D-57`)

### 6.1 Payment Gateway Webhooks (`POST /api/webhooks/billing`)
- **Signature Verification:** Every incoming webhook **MUST** be cryptographically verified against the gateway's webhook secret (`XENDIT_WEBHOOK_TOKEN`, `MIDTRANS_SERVER_KEY` SHA-512 signature, or `MAYAR_WEBHOOK_SECRET`) using constant-time comparison (`crypto.timingSafeEqual`) before parsing business fields.
- **Replay & Duplicate Protection:** Every verified event's `gateway_event_id` is inserted into `public.billing_events` (`UNIQUE`). Duplicate deliveries return `200 OK` without re-extending the subscription.
- **Server-Side Price Authority:** The webhook handler verifies that the paid amount matches the expected IDR price (`29000`, `79000`, `150000`, or `250000`, `D-16`) before activating or extending Pro.

### 6.2 Vercel Cron Authentication (`GET /api/cron/daily`)
- **MUST** verify `Authorization: Bearer ${process.env.CRON_SECRET}` using `crypto.timingSafeEqual`. Any request without a matching secret returns `401 Unauthorized`.

### 6.3 Email Anti-Abuse & Injection Prevention (`D-51`, `D-57`)
- **Rate Limits (`D-57`):**
  - Max **50 invoice emails per calendar day (WIB)** per Pro user account.
  - Max **5 invoice emails per calendar day (WIB)** for the same `invoice_id`.
- **Header & HTML Injection Prevention:**
  - `recipientEmail` is validated with `z.string().email()` and stripped of CR/LF (`\r`, `\n`) characters to prevent SMTP header injection.
  - User-supplied `subject`, `message`, `sender_name`, and `client_name` are rendered through React Email components, which automatically escape HTML entities (`<`, `>`, `&`, `"`, `'`).

---

## 7. Indonesian Personal Data Protection Law (UU PDP No. 27/2022) Compliance (`NFR-3`, `D-58`)

### 7.1 Personal Data Inventory & Purpose

| Data Category | Examples | Role under UU PDP | Lawful Basis |
| :--- | :--- | :--- | :--- |
| **Account Holder Data** | Google email, display name, business address, phone, tax ID, bank account details | **Data Controller** | Contract performance (providing the SaaS service) |
| **Invoice Recipient (Client) Data** | Client name, client email, client company, client billing address | **Data Processor** (on behalf of the user) | Legitimate interest / instruction of the Account Holder |
| **Billing & Subscription Logs** | Payment reference ID, plan duration, amount paid, timestamp | **Data Controller** | Contract performance & Indonesian financial/tax record-keeping |

### 7.2 Data Minimization
- Because `D-24` and `D-31` require Google Sign-In before creating or previewing an invoice, the platform **does not collect device fingerprints or track visitor IP addresses** in the database for guest quota enforcement.
- Payment card numbers, e-wallet PINs, and bank login credentials are **never** touched or stored by our servers; all payment entry happens on the licensed Indonesian payment gateway's hosted checkout page (`D-10`).

### 7.3 User Rights & Manual Account Deletion Procedure (`D-58`)
For the MVP, account deletion requests under UU PDP (Right to Erasure / *Hak untuk Menghapus Data*) are handled manually via support email (`D-58`):
1. **User-Facing Disclosure:** Both `/settings` and `/privacy` display clear instructions: *"To request complete account and data deletion, email `support@tagiva.com` from your registered Google email address."*
2. **Verification & Execution SLA:**
   - Support verifies the request comes from the registered email address.
   - Deleting the user in Supabase Auth (`auth.users`) cascades (`ON DELETE CASCADE`) to permanently erase `profiles`, `invoices`, `invoice_items`, `customers`, `invoice_sequences`, `subscription_reminders`, and `invoice_email_logs`, and support deletes the folder `{user_id}/` from the `business-logos` Storage bucket within **3 × 24 hours** (72 hours, well within UU PDP requirements).
   - If required for financial audit, anonymized payment ledger rows may be retained without personal identifiers.

---

## 8. HTTP Security Headers & Environment Secrets

### 8.1 Required HTTP Response Headers (`next.config.ts`)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 8.2 Environment Variables Classification

| Variable | Exposure | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | Supabase anon key (safe only because RLS is enabled on every table) |
| `NEXT_PUBLIC_APP_URL` | Public (Client + Server) | Canonical domain for public links (`https://tagiva.com`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only Secret** | Used strictly in verified webhook & cron route handlers |
| `RESEND_API_KEY` | **Server-Only Secret** | Transactional email dispatch |
| `PAYMENT_GATEWAY_SECRET_KEY` | **Server-Only Secret** | Creating checkouts with Xendit / Midtrans / Mayar |
| `PAYMENT_GATEWAY_WEBHOOK_SECRET` | **Server-Only Secret** | Verifying incoming billing webhooks |
| `CRON_SECRET` | **Server-Only Secret** | Authenticating Vercel Cron requests |

---

## 9. Assumptions & Open Questions

### 9.1 Assumptions
| ID | Assumption |
| :--- | :--- |
| **SEC-A01** | Supabase project is hosted in the closest Southeast Asia region (`ap-southeast-1` Singapore) with daily automated backups enabled on production. |

### 9.2 Open Questions
All security and privacy questions (`Q-15`, `Q-17`) have been resolved as `D-57` and `D-58`. No unresolved security questions remain.

---

## 10. Change history

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0.0 | 2026-10-27 | Initial security & UU PDP specification aligned with `PRD.md` (`D-01`–`D-58`), `ARCHITECTURE.md`, `DATABASE.md`, and `API.md`. |
