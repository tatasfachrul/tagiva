# DESIGN_SYSTEM — Visual Language, UI Tokens & Invoice Template Specification

| Field | Value |
| :--- | :--- |
| Product name | **Tagiva** (`tagiva.com`, see `PRD.md` `D-59`) |
| Document status | **Approved** |
| Version | 1.1.0 |
| Last updated | 2026-10-27 |
| Depends on | `PRD.md` (v1.0.0) |

---

## 0. Purpose of this document

This document defines the **visual design system**, **UI component tokens**, **typography**, **spacing**, **accessibility rules**, and the **exact visual specification of the single MVP invoice template**.

Its goals are:
1. Give engineers and AI agents unambiguous visual tokens (colors, fonts, sizes, spacing, borders, states) so every screen looks consistent without ad-hoc styling.
2. Guarantee **1:1 visual parity** between the on-screen invoice preview, the public invoice link, and the exported A4 PDF (`PRD.md` FR-7.1).
3. Reflect all product rules visually—such as `[DRAFT]` numbering (`D-30`), status badges (`D-15`), Lapsed read-only controls (`D-28`), and Free/Lapsed vs. Pro platform footers (`D-11`, `FR-7.3`).

How to read requirement keywords:
- **MUST**: required for MVP launch.
- **SHOULD**: expected for MVP. Can only be dropped with an explicit decision.
- **MAY**: optional polish.

---

## 1. Reused decisions from `PRD.md`

| Decision ID | Summary | Impact on Design System |
| :--- | :--- | :--- |
| **D-03** | MVP ships with **1 invoice template**; data model supports future templates. | Only the "Modern Minimalist" template is specified here, built as an isolated, swappable template component. |
| **D-04, D-11** | Custom logo, watermark removal, public link, and email sending are **Pro-only**. | Pro-gated controls display a consistent `PRO` badge and upgrade lock state for Free and Lapsed users. |
| **D-09, D-17, D-25** | UI and invoices support **English** and **Bahasa Indonesia**; currencies formatted per locale (IDR default). | UI layouts must accommodate longer Indonesian labels without truncation; numbers use tabular numerals (`tabular-nums`). |
| **D-13, D-30** | Number format `INV-[PREFIX]-[YYYY]-[MM]-[XXXX]`; drafts show `[DRAFT]`. | Invoice number field uses monospace/tabular styling and renders a distinct `[DRAFT]` pill/label before issuance. |
| **D-15** | Status values: `Draft`, `Sent`, `Paid`, `Overdue`. | Four semantic status badge styles are defined in Section 3.3. |
| **D-23, D-28, D-33** | Lapsed users: existing invoices are read-only except marking `Sent`/`Overdue` as `Paid`. | Read-only banner and disabled form states must clearly explain why fields are locked and keep the "Mark as Paid" CTA active. |
| **D-27** | Logo stays on existing invoices after Pro ends. | Invoice renderer checks whether the invoice itself retains a saved logo URL, independent of whether the logo uploader is currently locked. |
| **D-34** | **Light mode only** for the MVP. | All tokens are specified for light surfaces; no dark-mode token overrides in MVP. |
| **D-35** | Brand palette: **Deep Slate & Royal Blue / Indigo**. | Primary interactive and brand tokens use Indigo/Royal Blue paired with Slate neutrals. |
| **D-36** | Single MVP invoice template uses a **fixed neutral black/slate palette**. | The invoice sheet itself uses crisp slate/black ink on white paper for print safety and timeless professionalism. |
| **D-37** | **Tailwind CSS + shadcn/ui (Radix UI) + Lucide icons**. | All UI primitives follow shadcn/ui CSS variable conventions and Lucide 16px/20px icon sizing. |

---

## 2. Design Principles

1. **Financial Clarity First:** Numbers, totals, dates, and statuses must be scannable in under 2 seconds. All currency amounts, quantities, and invoice numbers **MUST** use `font-variant-numeric: tabular-nums`.
2. **Paper-Accurate Preview:** The invoice preview sheet looks like a physical A4 sheet resting on a subtle slate canvas, giving the user confidence in what their client will receive.
3. **Honest Entitlement Signaling:** Pro-only features (Logo upload, Public Link, Email send) and Free/Lapsed limits are visible—never hidden behind confusing errors—and clearly marked with a subtle `Pro` badge.
4. **Bilingual Resilience:** Every button, table column, and badge **MUST** work in both English and Bahasa Indonesia (where phrases like *"Menunggu Pembayaran"* or *"Tanggal Jatuh Tempo"* are ~35% longer than *"Sent"* or *"Due Date"*).

---

## 3. Color System (Light Mode — D-34, D-35)

### 3.1 Application Shell & Surface Tokens

| Token Name | CSS Variable | Hex | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Background (App Canvas)** | `--background` | `#F8FAFC` | `slate-50` | Main workspace background behind cards and invoice sheet |
| **Surface (Card / Panel)** | `--card` | `#FFFFFF` | `white` | Form panels, tables, modals, top navigation |
| **Surface Muted** | `--muted` | `#F1F5F9` | `slate-100` | Table headers, secondary badges, subtle hover states, read-only inputs |
| **Text Primary** | `--foreground` | `#0F172A` | `slate-900` | Headings, body text, form input values, totals |
| **Text Secondary** | `--muted-foreground` | `#475569` | `slate-600` | Field labels, helper text, secondary table columns |
| **Text Placeholder / Disabled** | `--placeholder` | `#94A3B8` | `slate-400` | Input placeholders, disabled text |
| **Border Default** | `--border` | `#E2E8F0` | `slate-200` | Card borders, table row dividers, input borders |
| **Border Strong** | `--border-strong` | `#CBD5E1` | `slate-300` | Hovered inputs, active dividers |

### 3.2 Brand & Interactive Tokens (Royal Blue / Indigo — D-35)

| Token Name | CSS Variable | Hex | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `--primary` | `#2563EB` | `blue-600` | Primary CTAs ("Create Invoice", "Send Email", "Upgrade to Pro"), active nav |
| **Primary Hover** | `--primary-hover` | `#1D4ED8` | `blue-700` | Hover state for primary buttons |
| **Primary Subtle** | `--primary-subtle` | `#EFF6FF` | `blue-50` | Selected row highlight, active tab background, Pro badge fill |
| **Primary Accent Text** | `--primary-text` | `#1E40AF` | `blue-800` | Text inside `Primary Subtle` badges and banners |
| **Focus Ring** | `--ring` | `#3B82F6` | `blue-500` | 2px keyboard focus outline (`ring-2 ring-blue-500/30`) |

### 3.3 Semantic & Invoice Status Tokens (D-15)

Each status (`Draft`, `Sent`, `Paid`, `Overdue`) has a dedicated background, border, and text token so status badges are accessible (WCAG AA ≥ 4.5:1 contrast) and distinguishable even for color-blind users (paired with an icon or dot).

| Status / Role | Background | Border | Text / Icon | Icon (Lucide) | Label (EN / ID) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Draft`** | `#F1F5F9` (`slate-100`) | `#CBD5E1` (`slate-300`) | `#334155` (`slate-700`) | `FileEdit` | Draft / Draf |
| **`Sent`** | `#EFF6FF` (`blue-50`) | `#BFDBFE` (`blue-200`) | `#1D4ED8` (`blue-700`) | `Send` | Sent / Terkirim |
| **`Paid`** | `#ECFDF5` (`emerald-50`) | `#A7F3D0` (`emerald-200`) | `#047857` (`emerald-700`) | `CheckCircle2` | Paid / Lunas |
| **`Overdue`** | `#FEF2F2` (`red-50`) | `#FECACA` (`red-200`) | `#B91C1C` (`red-700`) | `AlertCircle` | Overdue / Jatuh Tempo |
| **Warning / Expiry Reminder** | `#FFFBEB` (`amber-50`) | `#FDE68A` (`amber-200`) | `#B45309` (`amber-700`) | `Clock` | Subscription expiring banner (`D-26`) |
| **Pro Feature Badge** | `#EEF2FF` (`indigo-50`) | `#C7D2FE` (`indigo-200`) | `#4338CA` (`indigo-700`) | `Sparkles` or `Crown` | `PRO` |

### 3.4 Official Tagiva Brand Logo (`D-60`)

- **Canonical Asset Paths:**
  - Web Application & Favicon source: `/public/logo.png` (`1024 × 1024` 8-bit RGBA PNG)
  - Documentation archive: `/docs/assets/tagiva-logo.png`
- **Visual Composition & Brand Mark Colors:**
  - **Geometric "V" Mark:** Deep Navy (`#1B3668`)
  - **Rising Trend / Node Line:** Growth Green (`#78BE43`)
- **Placement & Sizing Rules:**
  - **Top Navigation Bar / Sidebar Brand Lockup:** `32px × 32px` (`w-8 h-8 object-contain`) paired with `Tagiva` wordmark in `Plus Jakarta Sans` `700` (`18px`, `#0F172A`, `gap-2.5`).
  - **Login & Onboarding Card Header (`/login`, `/onboarding`):** `48px × 48px` (`w-12 h-12`) centered above the heading.
  - **Free & Lapsed Platform Attribution Footer (`FR-7.3`, `D-40`):** Optional `14px × 14px` inline mark alongside `Made with Tagiva • tagiva.com`.
  - **Important Distinction (`D-04` vs `D-60`):** `public/logo.png` is the **Tagiva platform logo**. It is **never** placed in the sender's custom business logo slot on a user's invoice (`D-04`). If a Free user creates an invoice, the sender header shows only the user's Business Name text (no logo), while the Tagiva attribution sits subtly in the bottom page footer (`FR-7.3`).

---

## 4. Typography

### 4.1 Font Families (`D-41`)

| Role | Font Family | Source | Why |
| :--- | :--- | :--- | :--- |
| **Application UI (`--font-sans`)** | **Plus Jakarta Sans** | `next/font/google` (self-hosted at build time) | Friendly, crisp geometric legibility for navigation, dashboard tables, and forms in EN/ID. |
| **Invoice Document & PDF (`--font-invoice`)** | **Inter** (exclusively) | `next/font/google` + registered in PDF renderer | **All text inside the invoice template and exported PDF MUST use `Inter` only** (`D-41`), with `font-variant-numeric: tabular-nums` enabled for numbers, invoice IDs, and totals. |
| **UI Code / Technical Badges (`--font-mono`)** | **JetBrains Mono** | `next/font/google` | Used in the application shell (outside the invoice document) where monospace distinction is helpful. |

### 4.2 Type Scale (Application UI)

| Style | Size (`rem` / `px`) | Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title (`h1`)** | `1.5rem` (24px) | `2rem` (32px) | `700` (Bold) | `-0.02em` | Dashboard header, Settings header |
| **Section Heading (`h2`)** | `1.125rem` (18px) | `1.75rem` (28px) | `600` (SemiBold) | `-0.01em` | Card titles, Modal titles |
| **Subheading (`h3`)** | `0.9375rem` (15px) | `1.375rem` (22px) | `600` (SemiBold) | `0` | Form group headers ("Billed To", "Line Items") |
| **Body Default** | `0.875rem` (14px) | `1.25rem` (20px) | `400` (Regular) | `0` | Form inputs, table cells, standard buttons |
| **Body Medium / Label** | `0.875rem` (14px) | `1.25rem` (20px) | `500` (Medium) | `0` | Field labels, navigation items |
| **Caption / Helper** | `0.75rem` (12px) | `1rem` (16px) | `400` / `500` | `0.01em` | Validation messages, timestamps, badges |

### 4.3 Numeric Formatting Rules
- **MUST** apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to all currency values, quantities, percentages, dates, and invoice numbers.
- **MUST** right-align (`text-right`) all monetary columns (Unit Price, Line Total, Subtotal, Discount, Tax, Grand Total) in both UI tables and the invoice template.

---

## 5. Layout, Spacing & Responsive Grid

### 5.1 Spacing Scale
Uses the standard 4px (`0.25rem`) Tailwind base unit (`4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`).
- **Card internal padding:** `24px` (`p-6`) on desktop, `16px` (`p-4`) on mobile.
- **Form field vertical gap:** `16px` (`space-y-4`).
- **Border radius:**
  - Cards & Modals: `12px` (`rounded-xl`)
  - Inputs & Buttons: `8px` (`rounded-lg`)
  - Badges & Pills: `9999px` (`rounded-full`) or `6px` (`rounded-md`)

### 5.2 Responsive Breakpoints (`NFR-1`)

| Breakpoint | Width | Layout Behavior |
| :--- | :--- | :--- |
| **Mobile** (`< 768px`) | Single column | Top navigation bar + bottom/slide-over menu. Invoice Builder uses a **segmented tab toggle** (`Edit Form` \| `Live Preview`) so the user doesn't have to scroll past a giant form to see the preview. |
| **Tablet** (`768px – 1023px`) | Stacked or collapsible | Sidebar collapses to icon rail or drawer; Invoice Builder uses tabbed toggle or 50/50 split in landscape. |
| **Desktop** (`≥ 1024px`) | Split workspace | Left sidebar (`240px` fixed). Invoice Builder uses a **two-column split view**: Form Editor on the left (`50%`, scrollable) and sticky A4 Live Preview on the right (`50%`, scaled to fit viewport height). |

---

## 6. Core UI Components & Plan-State Visuals (shadcn/ui — D-37)

### 6.1 Buttons
- **Primary (`variant="default"`):** `bg-blue-600 text-white hover:bg-blue-700 shadow-xs` — main action per screen (maximum 1 primary CTA per header).
- **Secondary / Outline (`variant="outline"`):** `bg-white border-slate-200 text-slate-700 hover:bg-slate-50` — "Download PDF", "Duplicate".
- **Destructive (`variant="destructive"`):** `bg-red-600 text-white hover:bg-red-700` — "Delete Draft" confirmation.
- **Pro-Locked Action Button:** For Free and Lapsed users viewing Pro actions ("Send via Email", "Create Public Link", "Upload Logo"):
  - Renders in `outline` style with a `Lock` or `Sparkles` icon and a `PRO` pill badge (`#EEF2FF` / `#4338CA`).
  - Clicking opens the Upgrade to Pro modal (`D-11`, `D-16`).

### 6.2 Plan & Entitlement Visual Indicators
To enforce `PRD.md` Section 4.2 clearly in the interface:

1. **Free Tier Slot Counter (`D-12`, `D-21`):**
   - Displayed in the sidebar and dashboard header for Free users:
     - `Invoices used: 1 / 3 Free slots` with a 3-segment progress bar.
     - At `3 / 3`: turns amber (`#FFFBEB` / `#B45309`) with a direct "Upgrade to Pro (from Rp29.000/mo)" button.
2. **Lapsed User Read-Only Banner (`D-23`, `D-28`, `D-33`):**
   - Persistent top banner on existing invoices when status is Lapsed:
     - *"Your Pro subscription has ended. Existing invoices are read-only, except marking Sent invoices as Paid. Renew Pro to edit or send invoices."*
   - In the Invoice View for a Lapsed user:
     - All form inputs are rendered `disabled` (`bg-slate-100 text-slate-500 cursor-not-allowed`).
     - If invoice status is `Sent` or `Overdue`, the **"Mark as Paid"** button remains **enabled and prominent** (`D-28`).
3. **Subscription Expiry Reminder Banner (`D-26`):**
   - Displayed inside the app at 30 days, 14 days, 3 days, and 0 days before Pro expires:
     - 30d / 14d: Neutral/Info Blue banner with "Extend Subscription" button.
     - 3d / Last day: Amber/Red urgency banner with countdown and "Renew Now" button.
4. **Free Tier Delete Restriction (`D-29`):**
   - On the Free plan, the "Delete" action is enabled on `Draft` invoices and disabled (with tooltip: *"Sent, Overdue, and Paid invoices cannot be deleted on the Free plan"*) on non-draft invoices.

---

## 7. The Single MVP Invoice Template Specification ("Modern Minimalist" — D-03, D-36)

### 7.1 Page Geometry & Print Rules (`FR-7.1`, `FR-7.2`)
- **Paper Size:** ISO A4 (`210mm × 297mm`, aspect ratio `1 : 1.4142`).
- **On-Screen Preview Container:** `794px × 1123px` logical base (96 DPI equivalent of A4), CSS-scaled smoothly to fit the preview pane, with `bg-white shadow-sm ring-1 ring-slate-200`.
- **Page Margins:** `16mm` (`~60px`) on top, bottom, left, and right.
- **Color Palette (`D-36`):** Fixed high-contrast neutral slate/black on pure white (`#FFFFFF`):
  - Primary ink: `#0F172A` (`slate-900`)
  - Secondary labels: `#475569` (`slate-600`)
  - Muted metadata / borders: `#E2E8F0` (`slate-200`)
  - Table header fill: `#F8FAFC` (`slate-50`)

### 7.2 Template Visual Structure (Top to Bottom)

```
+-----------------------------------------------------------------------+
| [LOGO (Pro, max 180x64px)]                        INVOICE / FAKTUR    |
| Business Name (16px Bold)                         INV-ACM-2026-11-0001|
| Business Address, Email, Phone, Tax ID            or [DRAFT] (D-30)   |
|                                                   [Status Badge]      |
+-----------------------------------------------------------------------+
| BILLED TO / DITAGIHKAN KEPADA          ISSUE DATE / TGL:  27 Oct 2026 |
| Client Name (14px SemiBold)            DUE DATE / JATUH TEMPO:        |
| Client Company                         10 Nov 2026                    |
| Client Address & Email                 CURRENCY / MATA UANG: IDR      |
+-----------------------------------------------------------------------+
| DESCRIPTION / DESKRIPSI           QTY      UNIT PRICE          TOTAL  |
|-----------------------------------------------------------------------|
| UI/UX Design Phase 1                1    Rp10.000.000   Rp10.000.000  |
| Frontend Implementation             1    Rp15.000.000   Rp15.000.000  |
+-----------------------------------------------------------------------+
|                                        Subtotal         Rp25.000.000  |
|                                        Discount (10%)   -Rp2.500.000  |
|                                        PPN (11%)         Rp2.475.000  |
|                                        =============================  |
|                                        TOTAL            Rp24.975.000  |
+-----------------------------------------------------------------------+
| PAYMENT INSTRUCTIONS / INSTRUKSI PEMBAYARAN                           |
| Bank: BCA  |  Account: 1234567890 (a/n PT Contoh)                     |
|                                                                       |
| NOTES / CATATAN                                                       |
| Payment due within 14 days. Thank you for your business.              |
+-----------------------------------------------------------------------+
|            Made with Tagiva — tagiva.com (Free/Lapsed only)           |
+-----------------------------------------------------------------------+
```

### 7.3 Section-by-Section Rules

1. **Header Zone (`Inter` only — `D-41`):**
   - **Left:** If the invoice has a logo (`D-04`, `D-27`), display the logo contained within a `180px × 64px` bounding box (`object-contain object-left`, `FR-6.3`). Below (or at the top if no logo) sits the Sender Business Name (`16px` bold `Inter`) and contact lines (`11px` regular `Inter`, `#475569`).
   - **Right:** Document title (`INVOICE` in EN / `FAKTUR` in ID, `24px` bold `Inter` tracking-tight), followed by the invoice number (`13px` medium `Inter` with `tabular-nums`).
   - **Draft State (`D-30`, `D-42`):** When status is `Draft`, the invoice number spot renders `[DRAFT]` (`Inter` SemiBold) inside a subtle slate border box so it is unmistakable that no final sequence number has been assigned yet.
2. **Metadata & Recipient Zone:**
   - Two-column grid: Left `60%` for "Billed To" / "Ditagihkan Kepada"; Right `40%` for key-value metadata (Issue Date, Due Date, Currency).
3. **Line Items Table (`FR-1.5`):**
   - Columns:
     1. `#` (optional row index, `5%`)
     2. `Description` / `Deskripsi` (`50%`, left-aligned, wraps multi-line text)
     3. `Qty` / `Jml` (`10%`, right-aligned, `tabular-nums`)
     4. `Unit Price` / `Harga Satuan` (`17.5%`, right-aligned, `tabular-nums`)
     5. `Amount` / `Jumlah` (`17.5%`, right-aligned, `tabular-nums`, medium weight)
   - Multi-page overflow: If line items exceed 1 A4 page, the table header repeats on page 2 and the Totals block stays together (`break-inside: avoid`).
4. **Totals Block (`FR-1.6`–`FR-1.8`):**
   - Right-aligned (`width: 45%` of sheet).
   - Shows `Subtotal`, `Discount` (only rendered if discount > 0), `Tax` (only rendered if tax label/rate is set), and a prominent `Grand Total` row (`14px` bold, top border `2px solid #0F172A`).
5. **Payment Instructions & Notes Zone (`FR-1.10`, `FR-1.11`):**
   - Anchored below the totals (`break-inside: avoid`).
   - Structured Bank Details (Bank Name, Account Number in `Inter` `tabular-nums`, Account Holder Name) plus optional free-text notes.
6. **Platform Footer / Watermark (`D-11`, `D-28`, `D-40`, `FR-7.3`):**
   - **Free and Lapsed users:** Renders a centered footer at the bottom margin of the A4 page (`10px` `Inter`, `#64748B`, top hair-line border `#E2E8F0`):
     `Made with Tagiva • tagiva.com` (EN) or `Dibuat dengan Tagiva • tagiva.com` (ID).
   - **Pro users:** Footer is completely omitted.

### 7.4 Bilingual Template Label Dictionary (`D-17`, `FR-1.12`)

| Key | English (`en` — Default) | Bahasa Indonesia (`id`) |
| :--- | :--- | :--- |
| `document_title` | `INVOICE` | `FAKTUR` |
| `draft_placeholder` | `[DRAFT]` | `[DRAFT]` (`D-42`) |
| `from_label` | `From` | `Dari` |
| `billed_to_label` | `Billed To` | `Ditagihkan Kepada` |
| `invoice_no_label` | `Invoice No.` | `No. Faktur` |
| `issue_date_label` | `Issue Date` | `Tanggal Terbit` |
| `due_date_label` | `Due Date` | `Jatuh Tempo` |
| `col_description` | `Description` | `Deskripsi` |
| `col_qty` | `Qty` | `Jml` |
| `col_unit_price` | `Unit Price` | `Harga Satuan` |
| `col_amount` | `Amount` | `Jumlah` |
| `subtotal_label` | `Subtotal` | `Subtotal` |
| `discount_label` | `Discount` | `Diskon` |
| `total_label` | `Total Due` | `Total Tagihan` |
| `payment_instructions_label` | `Payment Instructions` | `Instruksi Pembayaran` |
| `bank_name_label` | `Bank` | `Bank` |
| `account_no_label` | `Account No.` | `No. Rekening` |
| `account_holder_label` | `Account Holder` | `Atas Nama` |
| `notes_label` | `Notes / Terms` | `Catatan / Syarat` |
| `status_paid_stamp` | `PAID` | `LUNAS` |

---

## 8. Accessibility (a11y) Requirements

| ID | Requirement | Level |
| :--- | :--- | :--- |
| **DS-A11Y-1** | All text and status badges **MUST** meet WCAG 2.1 AA contrast ratios (`≥ 4.5:1` for normal text, `≥ 3:1` for large text and UI borders). | MUST |
| **DS-A11Y-2** | Every interactive control **MUST** be reachable via keyboard (`Tab` / `Shift+Tab`) and display a visible focus ring (`--ring`). | MUST |
| **DS-A11Y-3** | Status is never conveyed by color alone—every status badge includes a text label and an icon. | MUST |
| **DS-A11Y-4** | Icon-only buttons (such as "Remove line item" trash icon) **MUST** have an `aria-label` in the active UI language. | MUST |

---

## 9. Assumptions in this document

| ID | Assumption |
| :--- | :--- |
| **DS-A01** | Application UI typeface is **Plus Jakarta Sans**; the invoice document and PDF use **Inter** exclusively (`D-41`), loaded via `next/font/google` and registered in the PDF renderer. |
| **DS-A02** | Discount (`FR-1.7`) and Tax (`FR-1.8`) lines are hidden on the rendered invoice/PDF when their value is `0` or empty, keeping simple invoices clean. |
| **DS-A03** | On the public link and PDF, the header zone shows a clean status badge (`UNPAID / BELUM DIBAYAR`, `PAID / LUNAS`, or `OVERDUE / JATUH TEMPO`, `D-43`) rather than a diagonal watermark across the line items. |
| **DS-A04** | Dates on the invoice are formatted as `DD MMM YYYY` in the selected invoice language (for example `27 Oct 2026` in EN, `27 Okt 2026` in ID) to avoid `MM/DD` vs `DD/MM` ambiguity. |

---

## 10. Open questions in this document

All design system questions (`DS-Q01`–`DS-Q03`) have been resolved and recorded as `D-41`, `D-42`, and `D-43` in `PRD.md`.

---

## 11. Change history

| Version | Date | Change |
| :--- | :--- | :--- |
| 1.0.0 | 2026-10-27 | Initial specification aligned with `PRD.md` v1.0.0 and confirmed design decisions `D-34`–`D-37`. |
| 1.1.0 | 2026-10-27 | Approved. Set invoice template & PDF font to `Inter` only (`D-41`), confirmed `[DRAFT]` string (`D-42`), and confirmed public status badge (`D-43`). |
