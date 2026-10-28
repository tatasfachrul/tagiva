'use client';

/**
 * Tagiva - Live Split-Screen Invoice Workbench & Visitor Gate (D-24, D-31, A-22)
 *
 * Implements:
 * - README's primary lead feature: "Live Split-Screen Invoice Builder: Real-time A4 invoice preview
 *   (Inter typography with tabular-nums) paired with server-side PDF rendering via @react-pdf/renderer."
 * - D-24, D-31: Visitors CANNOT generate or preview real account PDFs unauthenticated; submitting gates
 *   to Google OAuth while preserving entered fields in sessionStorage ('tagiva_landing_draft', A-22).
 * - Exact domain engine integration: calculateInvoiceTotals, formatCurrency, SUPPORTED_CURRENCIES.
 * - DESIGN_SYSTEM.md Section 7.2 canonical sample values (PT Contoh, BCA 1234567890, UI/UX Design Phase 1).
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, FileText, Percent } from 'lucide-react';
import { toast } from 'sonner';
import {
  calculateInvoiceTotals,
  formatCurrency,
  SUPPORTED_CURRENCIES,
  type SupportedCurrency,
  type DiscountType,
} from '@/lib/domain/calculations';
import { DRAFT_NUMBER_PLACEHOLDER } from '@/lib/domain/numbering';
import { ModernMinimalistWebPreview, type InvoiceTemplateData } from '@/components/invoice-templates';
import type { InvoiceLanguage } from '@/lib/i18n/invoice-dictionary';

export function InteractiveTeaser() {
  const router = useRouter();

  // Grounded in DESIGN_SYSTEM.md Section 7.2 & UI_DICTIONARY
  const [clientName, setClientName] = useState('PT Contoh');
  const [clientCompany, setClientCompany] = useState('Jakarta Creative Studio');
  const [description, setDescription] = useState('UI/UX Design Phase 1');
  const [quantity, setQuantity] = useState('1');
  const [amount, setAmount] = useState('10000000');
  const [currency, setCurrency] = useState<SupportedCurrency>('IDR');
  const [language, setLanguage] = useState<InvoiceLanguage>('en');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [taxRate, setTaxRate] = useState<number>(11);
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('1234567890');
  const [accountHolder, setAccountHolder] = useState('PT Contoh');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const numericQty = Math.max(1, Number(quantity) || 1);
  const numericAmount = Math.max(0, Number(amount) || 0);
  const numericDiscount = Math.max(0, Number(discountValue) || 0);

  // Exact financial calculation engine from src/lib/domain/calculations.ts
  const calc = useMemo(() => {
    return calculateInvoiceTotals({
      items: [
        {
          description: description || 'UI/UX Design Phase 1',
          quantity: numericQty,
          unitPrice: numericAmount,
        },
        {
          description: 'Frontend Implementation',
          quantity: 1,
          unitPrice: currency === 'IDR' ? 15000000 : 1500,
        },
      ],
      discountType,
      discountValue: numericDiscount,
      taxRate,
    });
  }, [description, numericQty, numericAmount, currency, discountType, numericDiscount, taxRate]);

  // Real-time A4 sheet payload using ModernMinimalistWebPreview
  const liveSheetData: InvoiceTemplateData = useMemo(() => {
    return {
      id: 'workbench-draft',
      invoiceNumber: null, // D-30: NULL while in draft -> renders [DRAFT]
      status: 'draft',
      language,
      currency,
      issueDate: '2026-10-27',
      dueDate: '2026-11-10',
      senderName: 'Tagiva Studio Indonesia',
      senderEmail: 'invoices@tagiva.com',
      senderPhone: '+62 21 555 0192',
      senderAddress: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
      senderTaxId: '01.234.567.8-012.000',
      clientName: clientName || 'PT Contoh',
      clientCompany,
      clientEmail: 'finance@contoh.co.id',
      clientAddress: 'Jakarta, Indonesia',
      items: calc.items.map((item, idx) => ({
        id: `line-${idx + 1}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: calc.subtotal,
      discountType,
      discountValue: numericDiscount,
      discountAmount: calc.discountAmount,
      taxLabel: 'PPN',
      taxRate,
      taxAmount: calc.taxAmount,
      totalAmount: calc.totalAmount,
      paymentInstructions: {
        bankName,
        accountNumber,
        accountHolder,
        notes: 'Payment due within 14 days. Thank you for your business.',
      },
      notes: 'Payment due within 14 days. Thank you for your business.',
    };
  }, [
    language,
    currency,
    clientName,
    clientCompany,
    calc,
    discountType,
    numericDiscount,
    taxRate,
    bankName,
    accountNumber,
    accountHolder,
  ]);

  function handleCreateOrPreview(e: React.FormEvent) {
    e.preventDefault();
    setIsRedirecting(true);

    try {
      const numericUnitPrice = Number(amount) || 0;
      const draftPayload = {
        clientName: clientName.trim(),
        clientCompany: clientCompany.trim(),
        description: description.trim(),
        amount: numericUnitPrice,
        unitPrice: numericUnitPrice,
        currency,
        language,
        discountType,
        discountValue: numericDiscount,
        taxLabel: 'PPN',
        taxRate,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        items: [
          {
            id: 'item-1',
            description: description.trim() || 'UI/UX Design Phase 1',
            quantity: numericQty,
            unitPrice: numericUnitPrice,
            lineTotal: Math.round(numericQty * numericUnitPrice * 100) / 100,
          },
        ],
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tagiva_landing_draft', JSON.stringify(draftPayload));
      }

      toast.info('Please sign in with Google to continue.');
      router.push('/login?next=/invoices/new');
    } catch {
      router.push('/login');
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Top Workbench Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-muted/60 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded border border-border-strong bg-white px-2 py-0.5 text-xs font-mono font-semibold text-foreground">
            {DRAFT_NUMBER_PLACEHOLDER}
          </span>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Live Split-Screen Invoice Builder
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time A4 invoice preview (Inter typography with tabular-nums) • Calculation order: (Subtotal − Discount) + Tax
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white px-3 py-1.5 rounded-lg border border-border">
          <Lock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>Sign in with Google required to save or issue (D-24, D-31)</span>
        </div>
      </div>

      {/* Split-Screen Grid: Left Form Controls (5 cols) | Right Live A4 Sheet (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* LEFT PANE: Interactive Builder Controls */}
        <form
          onSubmit={handleCreateOrPreview}
          className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-6 bg-white"
        >
          <div className="flex flex-col gap-5">
            {/* Document Language & Currency Switcher */}
            <div className="grid grid-cols-2 gap-3 pb-4 border-b border-border">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workbench-language" className="text-xs font-semibold text-foreground">
                  Document Language (D-17)
                </Label>
                <div
                  id="workbench-language"
                  role="group"
                  aria-label="Document Language"
                  className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 border border-border"
                >
                  <button
                    type="button"
                    aria-pressed={language === 'en'}
                    onClick={() => setLanguage('en')}
                    className={`py-1 text-xs font-semibold rounded-md transition-colors ${
                      language === 'en'
                        ? 'bg-white text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    aria-pressed={language === 'id'}
                    onClick={() => setLanguage('id')}
                    className={`py-1 text-xs font-semibold rounded-md transition-colors ${
                      language === 'id'
                        ? 'bg-white text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Indonesia (ID)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workbench-currency" className="text-xs font-semibold text-foreground">
                  Currency (D-46)
                </Label>
                <Select
                  value={currency}
                  onValueChange={(val) => setCurrency(val as SupportedCurrency)}
                >
                  <SelectTrigger id="workbench-currency" className="h-9 text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <SelectItem key={curr} value={curr} className="text-xs font-mono">
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recipient ("Billed To") */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                Billed To (Client Details)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="teaserClient" className="text-xs font-medium text-foreground">
                    Billed To (Client Name)
                  </Label>
                  <Input
                    id="teaserClient"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="PT Contoh"
                    className="text-xs h-9"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="teaserCompany" className="text-xs font-medium text-foreground">
                    Company / Organization
                  </Label>
                  <Input
                    id="teaserCompany"
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Jakarta Creative Studio"
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Line Item */}
            <div className="flex flex-col gap-3 pt-3 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground">
                Line Item #1 (FR-1.5)
              </span>
              <div className="flex flex-col gap-1">
                <Label htmlFor="teaserDesc" className="text-xs font-medium text-foreground">
                  Service / Item Description
                </Label>
                <Input
                  id="teaserDesc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="UI/UX Design Phase 1"
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="teaserQty" className="text-xs font-medium text-foreground">
                    Quantity
                  </Label>
                  <Input
                    id="teaserQty"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="text-xs font-mono tabular-nums h-9 text-right"
                    required
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <Label htmlFor="teaserAmount" className="text-xs font-medium text-foreground">
                    Amount ({currency})
                  </Label>
                  <Input
                    id="teaserAmount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10000000"
                    className="text-xs font-mono tabular-nums h-9 text-right"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Discount (% vs Fixed, D-45) & Tax (1-click PPN 11%, D-44) */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="teaserDiscount" className="text-xs font-medium text-foreground">
                    Discount (D-45)
                  </Label>
                  <div className="inline-flex rounded bg-muted p-0.5 border border-border">
                    <button
                      type="button"
                      aria-pressed={discountType === 'percent'}
                      onClick={() => setDiscountType('percent')}
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                        discountType === 'percent'
                          ? 'bg-white text-foreground shadow-2xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      aria-pressed={discountType === 'fixed'}
                      onClick={() => setDiscountType('fixed')}
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded ${
                        discountType === 'fixed'
                          ? 'bg-white text-foreground shadow-2xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Fixed
                    </button>
                  </div>
                </div>
                <Input
                  id="teaserDiscount"
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="text-xs font-mono tabular-nums h-9 text-right"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Tax Preset (D-44)</span>
                  <span className="text-[10px] font-mono text-muted-foreground">PPN</span>
                </div>
                <button
                  type="button"
                  aria-pressed={taxRate === 11}
                  onClick={() => setTaxRate((prev) => (prev === 11 ? 0 : 11))}
                  className={`h-9 px-3 rounded-lg border text-xs font-semibold inline-flex items-center justify-between transition-colors ${
                    taxRate === 11
                      ? 'bg-primary-subtle border-primary text-primary-text'
                      : 'bg-white border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Percent className="size-3.5" aria-hidden="true" />
                    Use PPN 11%
                  </span>
                  <span className="font-mono text-[11px]">{taxRate === 11 ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* Structured Bank Transfer Details (FR-1.10) */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-border">
              <span className="text-xs font-semibold text-muted-foreground">
                Payment Instructions (Bank Transfer Details)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="teaserBank" className="text-[11px] text-muted-foreground">
                    Bank
                  </Label>
                  <Input
                    id="teaserBank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="teaserAccNo" className="text-[11px] text-muted-foreground">
                    Account No.
                  </Label>
                  <Input
                    id="teaserAccNo"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-8 text-xs font-mono tabular-nums mt-0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="teaserHolder" className="text-[11px] text-muted-foreground">
                    Account Holder
                  </Label>
                  <Input
                    id="teaserHolder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="h-8 text-xs mt-0.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exact MoneyCalculator Output & Primary Action */}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <div className="rounded-lg bg-muted/70 p-3 border border-border flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal (2 items):</span>
                <span className="font-mono tabular-nums font-medium text-foreground">
                  {formatCurrency(calc.subtotal, currency)}
                </span>
              </div>
              {calc.discountAmount > 0 && (
                <div className="flex justify-between text-status-paid-text">
                  <span>
                    Discount ({discountType === 'percent' ? `${numericDiscount}%` : 'Fixed'}):
                  </span>
                  <span className="font-mono tabular-nums font-medium">
                    -{formatCurrency(calc.discountAmount, currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>PPN ({taxRate}%):</span>
                <span className="font-mono tabular-nums font-medium text-foreground">
                  {formatCurrency(calc.taxAmount, currency)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border font-bold text-foreground text-sm">
                <span>Total Due:</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(calc.totalAmount, currency)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isRedirecting}
              className="w-full h-10 font-semibold text-xs sm:text-sm gap-2 shadow-xs"
            >
              <FileText className="size-4" aria-hidden="true" />
              <span>{isRedirecting ? 'Redirecting to Google Sign-In...' : 'Preview & Create Invoice'}</span>
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Saves your draft inputs to <code className="font-mono">sessionStorage</code> and restores them on{' '}
              <code className="font-mono">/invoices/new</code> after Google sign-in (A-22).
            </p>
          </div>
        </form>

        {/* RIGHT PANE: Real-Time A4 Invoice Sheet (Inter font + tabular-nums) */}
        <div className="lg:col-span-7 bg-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start overflow-x-auto">
          <div className="w-full max-w-[794px] flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
            <span className="font-mono text-[11px]">
              ISO A4 (210mm × 297mm) • Font: Inter (tabular-nums)
            </span>
            <span className="font-mono text-[11px]">
              Template: modern-minimalist (D-03, D-36)
            </span>
          </div>

          <div className="w-full max-w-[794px]">
            <ModernMinimalistWebPreview
              invoice={liveSheetData}
              showFooter={true}
              className="min-h-0 [aspect-ratio:auto] p-6 sm:p-10 shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
