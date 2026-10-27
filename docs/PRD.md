# PRD — Product Requirements Document

| Field | Value |
| :--- | :--- |
| Product name | **Tagiva** (`D-59`) |
| Domain | **`tagiva.com`** (`D-59`) |
| Document status | **Approved** |
| Version | 1.1.0 |
| Last updated | 2026-10-27 |
| Owner | Product (founder) |

---

## 0. Purpose of this document

This PRD defines **what** we are building for the MVP and **why**. It doesn't define **how**. It is the single source of truth for product scope, business rules and plan limits.

All other documents (`DESIGN_SYSTEM.md`, `UX_FLOWS.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `SECURITY.md`, `CODE_STYLE.md`, `TESTING.md`, `AGENTS.md`) must follow the decisions recorded here. If another document conflicts with this one, this one wins until it is updated.

How to read requirement keywords:

- **MUST**: required for MVP launch.
- **SHOULD**: expected for MVP. Can only be dropped with an explicit decision.
- **MAY**: optional, nice to have.
- **OUT**: explicitly not in the MVP.

---

## 1. Decision log (confirmed)

These are the decisions the founder has confirmed. Other documents reference them by ID. Superseded decisions are kept (struck through) so the history stays traceable.

| ID | Decision | Source |
| :--- | :--- | :--- |
| D-01 | The product is a SaaS for creating, managing and sending invoices. | Initial brief |
| D-02 | Tech stack: **Next.js** (application), **Supabase** (database, auth, storage), **Vercel** (deployment). | Initial brief |
| D-03 | The MVP ships with **exactly 1 invoice template**. The data model must allow more templates later. | Initial brief |
| D-04 | Users can upload a custom logo for their invoices. This is a **paid** feature (see D-11). | Initial brief + Q&A |
| D-05 | Delivery channels: **PDF download**, **public shareable link**, **email sent from the app**. | Q&A |
| D-06 | Invoice payments are **manual**. The invoice shows payment instructions (for example bank transfer details) and the user updates the status by hand. The platform does **not** process money between the user and their client. | Q&A |
| ~~D-07~~ | ~~Guest-first. A guest can build one invoice and download it as a PDF.~~ **Superseded by D-24 and D-31.** | Q&A |
| D-08 | **Freemium** business model with a paid subscription. | Q&A |
| D-09 | Target market: **Indonesia only**. UI in **Bahasa Indonesia and English**. **IDR is the default currency**, and invoices may use other currencies. | Q&A |
| D-10 | The subscription is collected through a **local Indonesian payment gateway** (candidates: Midtrans, Xendit, Mayar). The specific provider has **not** been chosen yet. Stripe is **not** used. | Q&A |
| D-11 | Paid-only features: custom logo, no platform footer/watermark, unlimited saved invoices, public shareable link, sending invoices by email. | Q&A |
| D-12 | Free plan: **3 saved invoices per account, in total** (not per month), until the user subscribes. | Q&A |
| D-13 | Invoice number format: `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`. `PREFIX` is configured by the user (for example user or company initials). `XXXX` is a 4-digit sequence that **resets to 0001 every calendar year**. `MM` is the issue month and does **not** reset the sequence. | Comment + Q&A |
| D-14 | Sign-in method: **Google sign-in only**. | Q&A |
| D-15 | Invoice status values: `Draft`, `Sent`, `Paid`, `Overdue`. | Approved plan |
| D-16 | Pro pricing: **Rp29.000 / 1 month**, **Rp79.000 / 3 months**, **Rp150.000 / 6 months**, **Rp250.000 / 12 months**. | Q&A round 2 |
| D-17 | The invoice document (preview, PDF, public page, email) is in the **selected invoice language**, Indonesian or English. **Default: English.** | Q&A round 2 |
| D-18 | Changing the prefix does **not** restart the sequence. The sequence belongs to the **account** (not the prefix) and only resets at the start of a new year (D-13). | Q&A round 2 |
| ~~D-19~~ | ~~A guest invoice saved after sign-up uses one Free slot.~~ **Superseded by D-24 and D-31.** | Q&A round 2 |
| ~~D-20~~ | ~~The guest limit is enforced on the server by device/IP.~~ **Superseded by D-24.** No device or IP tracking is needed for invoice limits. | Q&A round 2 |
| D-21 | Deleting an invoice **gives back** a Free slot. | Q&A round 2 |
| D-22 | Billing supports **both** automatic renewal (auto-charge) **and** manual payment (the user pays again to extend). Automatic renewal is only offered for payment methods that the gateway can charge again; QRIS and virtual accounts are manual only. | Q&A rounds 2–3 |
| D-23 | When Pro ends, the user becomes **Lapsed** and their existing invoices become **read-only**, with the exceptions in D-28 and D-33. | Q&A round 2 |
| D-24 | **Only signed-in users can generate or preview invoices.** A visitor must sign in with Google first. | Q&A rounds 3–4 |
| D-25 | The user can change their **default invoice language** with a button. Default is English. The invoice language does **not** affect the currency. | Q&A round 3 |
| D-26 | Pro expiry reminders are sent **1 month, 2 weeks, 3 days and on the last day** before Pro ends. | Q&A round 3 |
| D-27 | When Pro ends, the logo **stays** on existing invoices. | Q&A round 3 |
| D-28 | **Lapsed users:** can view all their invoices; on existing invoices, the **only** change allowed is marking a `Sent` (or `Overdue`) invoice as `Paid` (everything else is disabled); can download PDFs **only with** the platform footer; all their existing invoices count toward the Free cap of 3. | Q&A rounds 3–4 |
| D-29 | **Free users can delete only `Draft` invoices.** `Sent`, `Overdue` and `Paid` invoices can't be deleted on Free. | Q&A rounds 2–3 |
| D-30 | **Drafts have no invoice number.** A draft shows `[DRAFT]` where the number would be. The real number (D-13) is assigned when the invoice leaves `Draft`. | Q&A round 3 |
| D-31 | Visitors **cannot preview** an invoice before signing in. When a visitor tries to preview or generate an invoice, they are forced to sign in with Google first. | Q&A round 4 |
| D-32 | The business profile stores a **default currency** (starting as IDR) that pre-fills each new invoice. The user can still change the currency on any individual invoice. | Q&A round 4 |
| D-33 | If a **Lapsed user** has **fewer than 3** saved invoices in total, they can create new invoices up to the Free cap of 3. If they have 3 or more, creating new invoices is blocked until they resubscribe. | Q&A round 4 |
| D-34 | App theme mode: **Light mode only** for the MVP. | Design Q&A |
| D-35 | Brand palette: **Deep Slate & Royal Blue / Indigo** (trustworthy, financial, crisp). | Design Q&A |
| D-36 | The single MVP invoice template uses a **fixed neutral black/slate palette** (no user-selectable accent color in the MVP). | Design Q&A |
| D-37 | UI component stack: **Tailwind CSS + shadcn/ui (Radix UI primitives) + Lucide icons**. | Design Q&A |
| D-38 | First-time Google sign-in leads to a **1-step Business Setup screen** (Business Name, Invoice Prefix, Default Currency, Bank Details) with a "Skip for now" option. | UX Q&A |
| D-39 | **Both Free and Pro** users can customize their invoice number prefix (`INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`). | UX Q&A (closes Q-08) |
| D-40 | When a Pro user becomes **Lapsed**, **existing public invoice links remain viewable** by the client (read-only, with the platform footer added). Lapsed users cannot create new public links. | UX Q&A (closes Q-16) |
| D-41 | Typography: App UI uses **Plus Jakarta Sans**; the **invoice document** (preview, public sheet, and PDF) uses **Inter only** (`tabular-nums`). | Design Q&A |
| D-42 | Draft placeholder string is always literally `[DRAFT]` in both English and Indonesian. | Design Q&A |
| D-43 | On the public invoice link (`/i/[token]`), the client-facing status badge shows `Unpaid` (`Belum Dibayar`), `Paid` (`Lunas`), or `Overdue` (`Jatuh Tempo`). | Design Q&A |
| D-44 | Tax line in the builder has editable Label + Percentage (default `0%`) and includes a 1-click `"Use PPN 11%"` preset chip. | UX Q&A (closes Q-04) |
| D-45 | Discount supports both **Percentage (`%`)** and **Fixed Amount** via a toggle. | UX Q&A (closes Q-05) |
| D-46 | Supported invoice currencies in MVP: `IDR` (default), `USD`, `SGD`, `EUR`, `AUD`, `GBP`, `MYR`, `JPY`. | UX Q&A (closes Q-06) |
| D-47 | Default UI language is **English**, with a visible `EN \| ID` switcher in the top header. | UX Q&A (closes Q-27) |
| D-48 | Billing uses a **Payment Gateway Adapter interface** supporting **Xendit, Midtrans, or Mayar** interchangeably. | Architecture Q&A |
| D-49 | PDF generation uses **`@react-pdf/renderer`** on the server with the **`Inter`** font (`D-41`) embedded. | Architecture Q&A |
| D-50 | Daily background tasks (expiry reminders `D-26` and subscription lapse transitions) run via **Vercel Cron Jobs** at `08:00 WIB` (`01:00 UTC`), paired with dynamic on-read `Overdue` evaluation. | Architecture Q&A |
| D-51 | Invoice email sender display name is `"[Business Name] via Tagiva"` from `invoices@tagiva.com`, with `Reply-To` set to the user's business email. | Architecture Q&A (closes Q-22) |
| D-52 | Failed auto-renewal charges have a **3-day grace period** (`past_due`) before the account becomes `Lapsed`. | Architecture Q&A (closes Q-29) |
| D-53 | Manual-payment users receive all 4 expiry reminders (`30d, 14d, 3d, 0d`); auto-renew users receive a single pre-charge notice **3 days before** renewal. | Architecture Q&A (closes Q-34) |
| D-54 | Invoice `PREFIX` rule: **2 to 6 uppercase alphanumeric characters** (`^[A-Z0-9]{2,6}$`), defaulting to 3 letters from the user's name or `USR`. | Database Q&A (closes Q-07) |
| D-55 | Invoice numbers are **100% system-generated** from the user's prefix (`[DRAFT]` → `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`). Manual free-text override is not allowed. | Database Q&A (closes Q-11) |
| D-56 | The yearly sequence counter is keyed by `(user_id, issue_date year)` so `YYYY` and the `0001` reset always match the invoice's `issue_date` year. | Database Q&A (closes Q-33) |
| D-57 | Pro email sending rate limits: **max 50 invoice emails per day (WIB) per account**, and **max 5 sends per day for the same single invoice**. | API/Security Q&A (closes Q-17) |
| D-58 | User account deletion requests (UU PDP) are handled **manually via support email** (`support@tagiva.com`) for the MVP. | API/Security Q&A (closes Q-15) |
| D-59 | Product name is **Tagiva** and primary domain is **`tagiva.com`**. | Founder decision |
| D-60 | Official **Tagiva brand logo** (`public/logo.png`, `1024×1024` RGBA PNG featuring the Navy `#1B3668` "V" and Growth Green `#78BE43` rising trend line) is used across the application header, auth screens, favicon, and platform attribution. | Founder asset upload |

> [!NOTE]
> Example of D-13 + D-18 + D-30: a user with prefix `ACM` creates three drafts. All show `[DRAFT]`. They send the first in Nov 2026 and the second in Dec 2026, then change the prefix to `ACME` and send the third in Dec 2026. Then they send one in Jan 2027. The numbers are `INV-ACM-2026-11-0001`, `INV-ACM-2026-12-0002`, `INV-ACME-2026-12-0003`, `INV-ACME-2027-01-0001`.

---

## 2. Problem and goals

### 2.1 Problem

Indonesian freelancers and small businesses need to send professional, branded invoices without spreadsheets, Word or Canva templates, and without heavy accounting software.

### 2.2 MVP goals

1. A new user can sign in with Google and download a professional invoice PDF in a few minutes.
2. A signed-in user can save invoices, track their status and number them consistently.
3. A paying user can brand invoices with their logo, share them by link and send them by email.
4. The product earns subscription revenue through a local payment gateway.

### 2.3 Success metrics

The metrics to track are listed below. **The target values have not been decided** (see Q-01).

| Metric | Definition |
| :--- | :--- |
| Visitor → sign-up conversion | Visitors who sign up ÷ landing page visitors |
| First invoice completion | Users who send or download their first invoice ÷ users who sign up |
| Free → paid conversion | Users who subscribe ÷ registered users |
| Free cap hit rate | Free users who reach 3 invoices ÷ registered users |
| Plan mix | Share of subscriptions by duration (1 / 3 / 6 / 12 months) |
| Renewal rate | Subscriptions renewed (auto or manual) ÷ subscriptions that reached their end date |

---

## 3. Users and roles

| Role | Description |
| :--- | :--- |
| **Visitor** | Not signed in. Can see the marketing and pricing pages. Forced to sign in with Google when trying to preview or create an invoice (D-24, D-31). |
| **Free user** | Signed in with Google, never subscribed. Can save up to 3 invoices in total. |
| **Pro user** | Signed in with an active subscription. Gets all paid features (D-11). |
| **Lapsed user** | Signed in, had Pro before, subscription has ended. Existing invoices are read-only except marking `Sent`/`Overdue` as `Paid` (D-28). Can create new invoices only if total saved invoices < 3 (D-33). |
| **Invoice recipient (client)** | The user's customer. Has no account. Gets the invoice by email or public link (only from Pro users). |

Assumption A-01: one account = one business profile. Multiple businesses per account and team members are **OUT** for the MVP.

---

## 4. Plans, pricing and entitlements

### 4.1 Pricing (D-16)

| Plan | Price | Effective per month | Saving vs. monthly |
| :--- | ---: | ---: | ---: |
| Pro 1 month | Rp29.000 | Rp29.000 | — |
| Pro 3 months | Rp79.000 | ≈ Rp26.300 | ≈ 9% |
| Pro 6 months | Rp150.000 | Rp25.000 | ≈ 14% |
| Pro 12 months | Rp250.000 | ≈ Rp20.800 | ≈ 28% |

All plans unlock the same Pro features. Only the duration and price differ.

### 4.2 Entitlements

| Capability | Visitor | Free | Pro | Lapsed |
| :--- | :---: | :---: | :---: | :---: |
| Create / preview a new invoice | ❌ forced to sign in (D-31) | ✅ until 3 in total | ✅ unlimited | ✅ only if total < 3 (D-33) |
| View own invoices | — | ✅ | ✅ | ✅ |
| Edit existing invoices | — | ✅ | ✅ | ❌ read-only (D-23, D-28) |
| Change status on existing invoices | — | ✅ | ✅ | Only `Sent`/`Overdue` → `Paid` (D-28) |
| Delete invoices | — | Only `Draft` (D-29) | ✅ any status (A-12) | ❌ |
| Download PDF | — | ✅ with footer | ✅ no footer | ✅ with footer (D-28) |
| Change default invoice language (D-25) | — | ✅ | ✅ | ✅ |
| Default currency in business profile (D-32) | — | ✅ | ✅ | ✅ |
| Business profile and payment instructions | — | ✅ | ✅ | ✅ (A-19) |
| Custom invoice prefix (D-13, D-39) | — | ✅ | ✅ | ✅ |
| Upload / change logo | — | ❌ | ✅ | ❌ |
| Logo shown on invoices | — | ❌ | ✅ | ✅ on existing invoices (D-27) |
| Create a public shareable link | — | ❌ | ✅ | ❌ |
| Existing public links keep working | — | — | ✅ | ✅ with platform footer (D-40) |
| Send invoice by email from the app | — | ❌ | ✅ | ❌ |

---

## 5. Functional requirements

### FR-1 Invoice builder (the single MVP template)

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-1.1 | The builder shows a form and a live preview of the invoice for signed-in users. The preview updates as the user types. | MUST |
| FR-1.2 | Sender section: business name, address, email, phone, tax ID (optional). Pre-filled from the business profile. | MUST |
| FR-1.3 | Recipient ("Billed to") section: client name, company (optional), email, address. | MUST |
| FR-1.4 | Invoice meta: invoice number (FR-2; `[DRAFT]` while in draft), issue date (default today), due date. | MUST |
| FR-1.5 | Line items: description, quantity, unit price, line total (= quantity × unit price). The user can add and remove rows. | MUST |
| FR-1.6 | Totals: subtotal, discount, tax, grand total. Calculation order: `grand total = (subtotal − discount) + tax`, where tax is applied to `(subtotal − discount)`. | MUST |
| FR-1.7 | Discount can be a fixed amount or a percentage. | SHOULD (see Q-05) |
| FR-1.8 | Tax is one line with an editable label (for example "PPN") and a percentage. There is no default rate. | MUST (see Q-04) |
| FR-1.9 | Currency is pre-filled from the business profile's default currency (starting as IDR, D-32) and can be changed on each invoice. Amounts are formatted for the chosen currency (for example `Rp1.500.000`, `$1,500.00`). Currency is independent of language (D-25). | MUST (list in Q-06) |
| FR-1.10 | Payment instructions: free text and/or structured bank details (bank name, account number, account holder). Pre-filled from the business profile. | MUST |
| FR-1.11 | Notes / terms: free text. | MUST |
| FR-1.12 | Invoice language: pre-filled from the user's default invoice language (D-25, default English) and can be changed per invoice (A-11). It changes the template's fixed labels (for example "Invoice" / "Faktur", "Due date" / "Jatuh tempo"). It doesn't translate what the user typed. | MUST |
| FR-1.13 | Item reordering. | MAY |

### FR-2 Invoice numbering

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-2.1 | Numbers follow D-13: `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`. | MUST |
| FR-2.2 | A `Draft` has no number. It displays `[DRAFT]` in the preview, list and PDF (D-30). | MUST |
| FR-2.3 | The number is assigned at the moment the invoice first leaves `Draft` (sent by email, public link created, or marked `Sent` by hand). Once assigned, it never changes. | MUST |
| FR-2.4 | `YYYY` and `MM` come from the invoice **issue date**. The yearly reset is based on the issue-date year (see Q-33 for back-dated invoices). | MUST |
| FR-2.5 | There is one sequence per account. It resets to `0001` at the start of each calendar year. Changing the prefix doesn't reset it (D-18). The current prefix is used at the moment of assignment. | MUST |
| FR-2.6 | The user sets `PREFIX` in their settings. Allowed characters and length: see Q-07. | MUST |
| FR-2.7 | Two invoices in the same account can never have the same number. | MUST |
| FR-2.8 | Numbers of deleted invoices are **not** reused. (With D-29 and D-30 this only happens when a Pro user deletes a non-draft invoice.) | MUST (assumption A-13) |
| FR-2.9 | If the sequence goes past `9999` in one year, it continues with 5 digits. | SHOULD (assumption A-05) |
| FR-2.10 | The user can override the number by hand. | Undecided (Q-11) |

### FR-3 Visitor access

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-3.1 | A visitor can see the landing page and the pricing page. | MUST |
| FR-3.2 | A visitor **cannot** preview, create, download or save an invoice (D-24, D-31). Attempting to preview or create an invoice forces the visitor to sign in with Google first. | MUST |
| FR-3.3 | If the landing page shows an invoice entry form as a lead-in, clicking "Preview" or "Create" prompts Google sign-in before rendering the invoice preview (and preserves any entered fields across sign-in, A-22). | SHOULD |

### FR-4 Authentication and account

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-4.1 | Sign-in with Google only (D-14). | MUST |
| FR-4.2 | Sign out. | MUST |
| FR-4.3 | Business profile settings: business details, default currency (D-32, default IDR), default invoice language (D-25, default English), invoice prefix, payment instructions, logo (Pro only). | MUST |
| FR-4.4 | A button to change the default invoice language: English or Bahasa Indonesia. Default English (D-25). | MUST |
| FR-4.5 | UI language switch between Bahasa Indonesia and English. Default UI language: see Q-27. | MUST |
| FR-4.6 | Account deletion by the user. | Undecided (Q-15) |

### FR-5 Invoice management

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-5.1 | List of the user's invoices with number (or `[DRAFT]`), client, total, issue date, due date and status. | MUST |
| FR-5.2 | Filter the list by status. | SHOULD |
| FR-5.3 | Search by client name or invoice number. | MAY |
| FR-5.4 | Create a new invoice: allowed for Free (if fewer than 3 invoices exist), Lapsed (if fewer than 3 invoices exist, D-33) and Pro (unlimited). When a Free or Lapsed user is at or above the 3-invoice cap, the create action shows the upgrade prompt. | MUST |
| FR-5.5 | Edit and duplicate an invoice: Free and Pro only. Lapsed users cannot edit existing invoices (D-23, D-28). Duplicating creates a new `Draft` and counts toward the Free cap. | MUST |
| FR-5.6 | Delete: Free users can delete only `Draft` invoices (D-29), which gives back a slot (D-21). Pro users can delete any status (A-12). Lapsed users can't delete existing invoices. | MUST |
| FR-5.7 | Download the PDF of a saved invoice. Footer rules: FR-7.3. | MUST |
| FR-5.8 | Status rules (D-15): new invoice = `Draft`. Sending by email, creating a public link, or marking it sent by hand → `Sent`. The user marks `Paid` by hand. `Overdue` is shown when today is after the due date and the status is `Sent`. | MUST |
| FR-5.9 | Free and Pro users can change status by hand between `Sent` and `Paid` (for example to undo). An invoice that has a number can't go back to `Draft` (A-16). | SHOULD |
| FR-5.10 | On existing invoices, Lapsed users can only change `Sent` (including `Overdue`, A-18) to `Paid`. All other editing controls on existing invoices are disabled (D-28). | MUST |
| FR-5.11 | Saved clients list (pick an existing client when creating an invoice). | SHOULD |
| FR-5.12 | Dashboard summary (for example total outstanding, total paid). | MAY |

### FR-6 Logo (Pro)

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-6.1 | Pro users can upload one logo for their business profile. It appears on the invoice, the PDF, the public link and the email. | MUST |
| FR-6.2 | Allowed formats: PNG, JPG, WEBP. Max size 2 MB. | MUST (assumption A-06) |
| FR-6.3 | The logo is scaled to fit the template without distortion. | MUST |
| FR-6.4 | When Pro ends, the logo stays on existing invoices (D-27). The Lapsed user can't upload or change it, and new invoices created by a Lapsed user under the Free cap (< 3) do not include the custom logo (A-23). | MUST |

### FR-7 PDF

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-7.1 | The PDF matches the on-screen template (layout, fonts, totals). | MUST |
| FR-7.2 | Paper size: A4. | MUST (assumption A-07) |
| FR-7.3 | Free and Lapsed PDFs include a small platform footer ("Made with Tagiva"). Pro PDFs don't. | MUST |
| FR-7.4 | The PDF uses the invoice language (D-17). | MUST |
| FR-7.5 | A draft PDF shows `[DRAFT]` instead of a number (D-30). | MUST |

### FR-8 Public shareable link (Pro)

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-8.1 | A Pro user can create a public link for a saved invoice. Creating the link moves a `Draft` to `Sent` and assigns the number (FR-2.3). | MUST |
| FR-8.2 | The link contains an unguessable token. Anyone with the link can view the invoice read-only and download the PDF, without signing in. | MUST |
| FR-8.3 | The public page uses the invoice language (D-17). | MUST |
| FR-8.4 | The user can turn off (revoke) a link. | SHOULD |
| FR-8.5 | What happens to existing links when Pro ends: see Q-16. | Undecided |

### FR-9 Email delivery (Pro)

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-9.1 | A Pro user can send a saved invoice to the client's email from the app. | MUST |
| FR-9.2 | The user can edit the recipient, subject and a short message before sending. | MUST |
| FR-9.3 | The email contains the invoice summary (number, total, due date), a link to the public invoice page and the PDF as an attachment. | MUST |
| FR-9.4 | The email's fixed text uses the invoice language (D-17). | MUST |
| FR-9.5 | The email is sent from a platform address. Replies go to the user's email (reply-to). | MUST (assumption A-08) |
| FR-9.6 | Sending moves a `Draft` to `Sent`, assigns the number (FR-2.3) and records the send time. | MUST |
| FR-9.7 | Sending limits per day (anti-abuse): see Q-17. | Undecided |

### FR-10 Subscription and billing

| ID | Requirement | Level |
| :--- | :--- | :--- |
| FR-10.1 | A Free or Lapsed user can buy Pro from the app and pick a duration: 1, 3, 6 or 12 months at the D-16 prices. | MUST |
| FR-10.2 | Payment goes through the local gateway (D-10). Pro is activated only after the gateway confirms the payment. | MUST |
| FR-10.3 | **Manual payment** (D-22): the user pays once for the chosen duration. Pro ends at the end of that period unless they pay again. | MUST |
| FR-10.4 | Paying again before Pro ends **adds** the new duration on top of the current end date. | MUST (assumption A-14) |
| FR-10.5 | **Automatic renewal** (D-22): the user saves a payment method that the gateway can charge again. At the end of each period, the same duration is charged again automatically. Offered only for methods that support it. | MUST |
| FR-10.6 | The user can turn auto-renewal off. Pro then stays active until the end of the period already paid. | MUST |
| FR-10.7 | Expiry reminders (D-26) are sent **30 days, 14 days, 3 days and 0 days (last day)** before Pro ends. Channel: in-app and email (A-20). Reminders whose date has already passed at purchase time are skipped (A-21). Whether auto-renew users also get them: Q-34. | MUST |
| FR-10.8 | When Pro ends, the user becomes Lapsed (D-23, D-28, D-33). | MUST |
| FR-10.9 | The user can see their plan, duration, status, period end date and whether auto-renewal is on. | MUST |
| FR-10.10 | Which payment methods support auto-renewal depends on the gateway chosen (Q-18). | Undecided |
| FR-10.11 | What happens when an automatic charge fails (retry, grace period): see Q-29. | Undecided |
| FR-10.12 | Refunds and changing duration mid-period: see Q-30. | Undecided |
| FR-10.13 | Users receive a payment receipt for their subscription. Format and tax treatment: see Q-21. | Undecided |

---

## 6. Non-functional requirements

| ID | Requirement | Level |
| :--- | :--- | :--- |
| NFR-1 | The app and public invoice page work on mobile and desktop browsers. | MUST |
| NFR-2 | Users can only access their own data. Public invoice pages expose only the invoice behind the token. | MUST |
| NFR-3 | Personal data handling must follow Indonesia's Personal Data Protection Law (UU PDP No. 27/2022). Details go in `SECURITY.md`. | MUST |
| NFR-4 | Money amounts are stored and calculated without floating-point rounding errors. | MUST |
| NFR-5 | All dates, subscription periods, reminders and the yearly sequence reset use the **Asia/Jakarta (WIB)** timezone. | MUST (assumption A-09) |
| NFR-6 | Plan limits (Free cap, Lapsed read-only, Pro-only features) are enforced on the server, not only hidden in the UI. | MUST |
| NFR-7 | Performance targets (page load, PDF generation time): to be set in `ARCHITECTURE.md`. | SHOULD |

---

## 7. Out of scope (MVP)

- More than one invoice template (D-03).
- Previewing or creating invoices without signing in (D-24, D-31).
- Collecting payments from the user's clients (payment links, "Pay now" buttons) (D-06).
- Stripe (D-10).
- Sign-in methods other than Google (D-14).
- Invoice languages other than English and Bahasa Indonesia.
- Multiple businesses per account, team members, roles.
- Recurring/automatic invoices to the user's clients (not the same as the user's own subscription auto-renewal, which **is** in scope).
- Quotes/estimates, credit notes, receipts for the user's clients.
- Integration with accounting software or the tax office (for example e-Faktur / Coretax).
- Native mobile apps.
- Markets outside Indonesia (D-09).

---

## 8. Assumptions

These are working assumptions. They are **not** confirmed decisions. Confirm or correct them during review.

| ID | Assumption |
| :--- | :--- |
| A-01 | One account = one business profile. |
| A-02 | Users are Indonesian freelancers and small businesses (no detailed personas yet). |
| A-03 | Tax handling is a simple percentage line. It is **not** a legally compliant Faktur Pajak. |
| A-04 | Free and Pro users can edit an invoice after it was sent (the number stays the same). |
| A-05 | The yearly sequence continues with 5 digits past 9999. |
| A-06 | Logo: PNG/JPG/WEBP, max 2 MB. SVG is excluded for security reasons. |
| A-07 | PDF paper size is A4 only. |
| A-08 | Email is sent from a platform address with reply-to set to the user's email. |
| A-09 | Timezone for dates, subscription periods, reminders and the yearly reset is Asia/Jakarta. |
| A-10 | Invoice amounts are entered tax-exclusive. |
| A-11 | The default invoice language (D-25) is applied to new invoices, and the user can also switch language on a single invoice. |
| A-12 | Pro users can delete invoices of any status. |
| A-13 | Deleted invoice numbers are not reused (gaps are allowed). |
| A-14 | Paying again manually before Pro ends adds the new duration on top of the current end date. |
| A-16 | Once an invoice has a number, it can't go back to `Draft`. |
| A-18 | For Lapsed users, an `Overdue` invoice can also be marked `Paid` (because `Overdue` is a `Sent` invoice past its due date). |
| A-19 | Lapsed users can still edit their business profile (it only affects future invoices). |
| A-20 | Expiry reminders are shown in the app and sent by email. |
| A-21 | Reminders already in the past at purchase time are skipped. Example: on a 1-month plan, the "1 month before" reminder is skipped. |
| A-22 | If a visitor fills any fields before clicking "Preview" and being prompted to sign in, those fields are preserved in session storage so they don't have to retype after Google sign-in. |
| A-23 | If a Lapsed user has < 3 invoices and creates a new invoice (D-33), that new invoice follows Free tier rules (no custom logo, includes platform footer, can be edited/deleted while in `Draft`). |

---

## 9. Open questions

### 9.1 Closed in this round

| ID | Answer | Recorded as |
| :--- | :--- | :--- |
| Q-31 | Visitors cannot preview an invoice before signing in; trying to preview forces Google sign-in first. | D-31 |
| Q-32 | Yes, store a default currency in the business profile (default IDR) and allow changing it per invoice. | D-32 |
| Q-35 | Yes, Lapsed users with fewer than 3 saved invoices can create new invoices up to the Free cap of 3. | D-33 |

### 9.2 Non-blocking open questions (can be resolved during later docs or before implementation)

None of the remaining questions block starting `DESIGN_SYSTEM.md` or `UX_FLOWS.md`.

| ID | Question | Relevant Document |
| :--- | :--- | :--- |
| Q-01 | What are the target values for the success metrics? | PRD / Analytics |
| Q-04 | Should "PPN" with a suggested rate be a preset, or is the tax line always free-form? Should tax be optional? | `DESIGN_SYSTEM.md` / `UX_FLOWS.md` |
| Q-05 | Is discount needed in the MVP? Fixed, percentage, or both? | `UX_FLOWS.md` / `DATABASE.md` |
| Q-06 | Which currencies besides IDR are allowed on invoices (for example IDR, USD, SGD, EUR, AUD, JPY)? | `UX_FLOWS.md` / `DATABASE.md` |
| Q-07 | Prefix rules: allowed characters (for example uppercase A–Z and 0–9), minimum and maximum length (for example 2–6 chars)? Default prefix for new users? | `UX_FLOWS.md` / `DATABASE.md` |
| Q-08 | Is the custom prefix available on Free, or only Pro? | `UX_FLOWS.md` / `API.md` |
| Q-11 | Can users override the invoice number by hand? If yes, how do we prevent duplicates and keep the sequence correct? | `UX_FLOWS.md` / `DATABASE.md` |
| Q-15 | Account deletion and data retention policy (UU PDP)? | `SECURITY.md` |
| Q-16 | When Pro ends, do existing public links keep working? | `UX_FLOWS.md` / `API.md` |
| Q-17 | Daily email sending limit per user? | `API.md` / `SECURITY.md` |
| Q-18 | Which gateway (Midtrans / Xendit / Mayar) and which payment methods? Which of them support auto-renewal? | `ARCHITECTURE.md` / `API.md` |
| Q-21 | Do you (the platform) issue tax invoices to subscribers? Is the company PKP (VAT-registered)? Are D-16 prices tax-inclusive? | Billing / Legal |
| Q-22 | Who is the email sender name (platform name or user's business name)? | `ARCHITECTURE.md` / `API.md` |
| Q-27 | Default UI language: English (same as invoices) or Bahasa Indonesia? Or detect from the browser? | `DESIGN_SYSTEM.md` / `UX_FLOWS.md` |
| Q-29 | Failed auto-renewal: how many retries, and is there a grace period before Pro ends? | `ARCHITECTURE.md` / `API.md` |
| Q-30 | Refunds: allowed or not? Can a user switch duration (for example 1 → 12 months) mid-period? | Billing / Legal |
| Q-33 | If an invoice is sent in Jan 2027 with an issue date in Dec 2026, does it take the next 2026 number or a 2027 number? | `DATABASE.md` / `API.md` |
| Q-34 | Do users with auto-renewal on also get the expiry reminders (as "your plan renews on…" notices), or only manual-payment users? | `ARCHITECTURE.md` |

---

## 10. Change history

| Version | Date | Change |
| :--- | :--- | :--- |
| 0.1.0 | 2026-10-27 | First draft based on the brief, the approved plan and the Q&A session. |
| 0.2.0 | 2026-10-27 | Added D-16 to D-23 (pricing, invoice language, numbering, guest rules, delete rules, billing modes, lapsed read-only). Added Lapsed role, pricing table, A-11 to A-14, Q-23 to Q-30. |
| 0.3.0 | 2026-10-27 | Sign-in required to create invoices (D-24 supersedes D-07, D-19, D-20). Added D-25 to D-30 (default language button, reminder schedule, logo after lapse, Lapsed rules, Free delete rule, draft numbering). Guest role replaced by Visitor. Added A-16 to A-21, Q-31 to Q-35. |
| 1.0.0 | 2026-10-27 | Resolved all blocking questions: added D-31 (no preview before sign-in), D-32 (default currency in profile, overridable per invoice), D-33 (Lapsed users with < 3 invoices can create up to the Free cap). Added A-22 and A-23. |
