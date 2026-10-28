'use client';

/**
 * Tagiva - 1-Step Onboarding Form Component
 *
 * Implements D-25, D-32, D-38, D-39, D-54:
 * - Pre-fills business name & 3-letter prefix
 * - Live preview of permanent invoice sequence (e.g. INV-USR-2026-10-0001)
 * - Default currency selector (IDR default)
 * - Default invoice language toggle (English default with ID toggle)
 * - Bank details for payment instructions
 * - "Save & Create First Invoice" + "Skip for now" actions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateBusinessProfileAction, skipOnboardingAction } from '@/features/settings/actions';
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '@/lib/domain/calculations';
import { getTodayWibString, getYearAndMonthWib } from '@/lib/domain/timezone';
import { validatePrefix } from '@/lib/domain/numbering';
import type { ProfileRow } from '@/types/database';

interface OnboardingFormProps {
  initialProfile: ProfileRow | null;
}

const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  IDR: 'IDR (Rp) — Indonesian Rupiah',
  USD: 'USD ($) — US Dollar',
  SGD: 'SGD (S$) — Singapore Dollar',
  EUR: 'EUR (€) — Euro',
  AUD: 'AUD (A$) — Australian Dollar',
  GBP: 'GBP (£) — British Pound',
  MYR: 'MYR (RM) — Malaysian Ringgit',
  JPY: 'JPY (¥) — Japanese Yen',
};

export function OnboardingForm({ initialProfile }: OnboardingFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState(initialProfile?.business_name || '');
  const [invoicePrefix, setInvoicePrefix] = useState(initialProfile?.invoice_prefix || 'USR');
  const [prefixBlurred, setPrefixBlurred] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState<SupportedCurrency>(
    initialProfile?.default_currency || 'IDR',
  );
  const [defaultLanguage, setDefaultLanguage] = useState<'en' | 'id'>(
    initialProfile?.default_language || 'en',
  );

  const [bankName, setBankName] = useState(initialProfile?.bank_details?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(
    initialProfile?.bank_details?.account_number || '',
  );
  const [accountHolder, setAccountHolder] = useState(
    initialProfile?.bank_details?.account_holder || '',
  );
  const [bankNotes, setBankNotes] = useState(initialProfile?.bank_details?.notes || '');

  // Calculate live preview date parts (WIB)
  const todayWib = getTodayWibString();
  const { year, month } = getYearAndMonthWib(todayWib);
  const prefixValidation = validatePrefix(invoicePrefix);
  const isPrefixValid = prefixValidation.valid;
  const normalizedPrefix = prefixValidation.normalizedPrefix;
  const previewNumber = `INV-${normalizedPrefix || 'XXX'}-${year}-${month}-0001`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage('Please enter your business or freelancer name.');
      return;
    }

    if (!isPrefixValid) {
      setErrorMessage(
        'Invoice prefix must be 2 to 6 uppercase letters or numbers (A-Z, 0-9). Example: ACME or INV.',
      );
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateBusinessProfileAction({
        businessName: businessName.trim(),
        email: initialProfile?.email || '',
        phone: initialProfile?.phone || '',
        address: initialProfile?.address || '',
        taxId: initialProfile?.tax_id || '',
        invoicePrefix: normalizedPrefix,
        defaultCurrency,
        defaultLanguage,
        bankDetails: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
          notes: bankNotes.trim(),
        },
      });

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsSaving(false);
        return;
      }

      router.push('/invoices/new');
    } catch {
      setErrorMessage('Failed to save settings. Please try again.');
      setIsSaving(false);
    }
  }

  async function handleSkip() {
    try {
      setIsSkipping(true);
      setErrorMessage(null);
      const result = await skipOnboardingAction();

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsSkipping(false);
        return;
      }

      router.push('/invoices/new');
    } catch {
      setErrorMessage('Failed to complete onboarding. Please try again.');
      setIsSkipping(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl border-slate-200/80 shadow-sm bg-white mx-auto">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {errorMessage && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Business Identity */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="text-sm font-semibold text-slate-900">
                Business / Your Name <span className="text-rose-500">*</span>
              </Label>
              <p className="text-xs text-slate-500 mb-1.5">
                This name appears as the sender on all your invoices.
              </p>
              <Input
                id="businessName"
                name="businessName"
                autoComplete="organization"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Studio, John Doe Design"
                className="w-full"
                required
              />
            </div>

            {/* Invoice Prefix + Live Preview */}
            <div className="space-y-2 field-group">
              <Label htmlFor="invoicePrefix" className="text-sm font-semibold text-slate-900">
                Invoice Prefix
              </Label>
              <p id="onboarding-prefix-hint" className="text-xs text-slate-500">
                2 to 6 uppercase letters or numbers (D-54). Changing prefix later will not reset your sequence.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Input
                  id="invoicePrefix"
                  name="invoicePrefix"
                  value={invoicePrefix}
                  minLength={2}
                  maxLength={6}
                  pattern="[A-Z0-9]{2,6}"
                  required
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-describedby="onboarding-prefix-hint"
                  aria-errormessage="onboarding-prefix-error"
                  aria-invalid={prefixBlurred && !isPrefixValid ? 'true' : undefined}
                  onBlur={() => setPrefixBlurred(true)}
                  onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. INV, ACME"
                  className={`w-full sm:w-44 font-mono uppercase ${
                    prefixBlurred && !isPrefixValid ? 'user-invalid-fallback' : ''
                  }`}
                />
                <div className="rounded-md bg-slate-100 border border-slate-200 px-3 py-2 text-xs text-slate-700 font-mono flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-slate-500">Preview:</span>
                  <span className="font-semibold text-primary">{previewNumber}</span>
                </div>
              </div>
              <p
                id="onboarding-prefix-error"
                className={`text-xs text-rose-600 font-medium ${
                  prefixBlurred && !isPrefixValid ? 'block' : 'field-error-msg'
                }`}
              >
                Must be 2–6 uppercase alphanumeric characters (^[A-Z0-9]&#123;2,6&#125;$).
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Section 2: Defaults */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="onboardingCurrency" className="text-sm font-semibold text-slate-900">
                Default Currency
              </Label>
              <p className="text-xs text-slate-500 mb-1.5">
                Pre-selected currency for new invoices.
              </p>
              <Select
                value={defaultCurrency}
                onValueChange={(val) => setDefaultCurrency(val as SupportedCurrency)}
              >
                <SelectTrigger id="onboardingCurrency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {CURRENCY_LABELS[curr]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-900">
                Default Document Language
              </Label>
              <p className="text-xs text-slate-500 mb-1.5">
                Language used on the invoice template & PDF.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={defaultLanguage === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDefaultLanguage('en')}
                  className="w-full font-medium"
                >
                  English (EN)
                </Button>
                <Button
                  type="button"
                  variant={defaultLanguage === 'id' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDefaultLanguage('id')}
                  className="w-full font-medium"
                >
                  Bahasa Indonesia (ID)
                </Button>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Section 3: Bank Details */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-slate-900">
                Bank Details (Payment Instructions)
              </Label>
              <p className="text-xs text-slate-500">
                Appears on your invoices so clients know where to transfer payment (optional).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="bankName" className="text-xs text-slate-600">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. BCA, Mandiri"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="accountNumber" className="text-xs text-slate-600">
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="mt-1 font-mono"
                />
              </div>

              <div>
                <Label htmlFor="accountHolder" className="text-xs text-slate-600">
                  Account Holder
                </Label>
                <Input
                  id="accountHolder"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bankNotes" className="text-xs text-slate-600">
                Payment Terms / Instructions (Optional)
              </Label>
              <Input
                id="bankNotes"
                value={bankNotes}
                onChange={(e) => setBankNotes(e.target.value)}
                placeholder="e.g. Please include invoice number in transfer note."
                className="mt-1"
              />
            </div>
          </div>

          <div className="h-px bg-slate-200 pt-2" />

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSaving || isSkipping}
              className="w-full sm:w-auto text-slate-600 hover:text-slate-900"
            >
              {isSkipping ? 'Skipping...' : 'Skip for now'}
            </Button>

            <Button
              type="submit"
              disabled={isSaving || isSkipping || !isPrefixValid}
              className="w-full sm:w-auto font-medium px-6 py-2.5 shadow-sm"
            >
              {isSaving ? 'Saving setup...' : 'Save & Create First Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
