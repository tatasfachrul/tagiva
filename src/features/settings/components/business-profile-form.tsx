'use client';

/**
 * Tagiva - Business Profile & Settings Form
 *
 * Implements:
 * - Business settings (Name, Email, Phone, Address, Tax ID)
 * - Invoice Prefix configuration (D-18, D-39, D-54) with live sequence preview
 * - Default currency and default invoice document language (D-25, D-32)
 * - Bank payment instructions
 * - UU PDP compliance data management & account deletion notice (D-58, NFR-3)
 */

import { useState } from 'react';
import { Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateBusinessProfileAction } from '@/features/settings/actions';
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from '@/lib/domain/calculations';
import { getTodayWibString, getYearAndMonthWib } from '@/lib/domain/timezone';
import { validatePrefix } from '@/lib/domain/numbering';
import type { ProfileRow } from '@/types/database';

interface BusinessProfileFormProps {
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

export function BusinessProfileForm({ initialProfile }: BusinessProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState(initialProfile?.business_name || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [address, setAddress] = useState(initialProfile?.address || '');
  const [taxId, setTaxId] = useState(initialProfile?.tax_id || '');

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

  // Live preview of permanent number
  const todayWib = getTodayWibString();
  const { year, month } = getYearAndMonthWib(todayWib);
  const prefixValidation = validatePrefix(invoicePrefix);
  const isPrefixValid = prefixValidation.valid;
  const normalizedPrefix = prefixValidation.normalizedPrefix;
  const previewNumber = `INV-${normalizedPrefix || 'XXX'}-${year}-${month}-0001`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!businessName.trim()) {
      setErrorMessage('Business name is required.');
      return;
    }

    if (!isPrefixValid) {
      setErrorMessage('Invoice prefix must be 2 to 6 uppercase alphanumeric characters (A-Z, 0-9).');
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateBusinessProfileAction({
        businessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        taxId: taxId.trim(),
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

      setSuccessMessage('Business profile and settings saved successfully.');
      setIsSaving(false);
    } catch {
      setErrorMessage('Failed to save settings. Please try again.');
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Business Details
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            This information appears as the sender header on your invoices.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {errorMessage && (
              <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
                {successMessage}
              </div>
            )}

            {/* Business Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="businessName" className="text-xs font-semibold text-slate-800">
                  Business / Company Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  name="businessName"
                  autoComplete="organization"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Creative PT"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-xs font-semibold text-slate-800">
                  Contact Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@acme.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-800">
                  Phone / WhatsApp
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="address" className="text-xs font-semibold text-slate-800">
                  Business Address
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Sudirman No. 1, Jakarta Pusat, 10220"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="taxId" className="text-xs font-semibold text-slate-800">
                  NPWP / Tax ID (Optional)
                </Label>
                <Input
                  id="taxId"
                  name="taxId"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. 01.234.567.8-901.000"
                  className="mt-1 max-w-sm"
                />
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Numbering & Defaults */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Invoice Numbering & Defaults
                </h3>
                <p id="invoice-prefix-hint" className="text-xs text-slate-500 mt-0.5">
                  Changing your prefix does not reset sequence numbers (D-18).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field-group">
                  <Label htmlFor="invoicePrefix" className="text-xs font-semibold text-slate-800">
                    Invoice Prefix (2–6 chars)
                  </Label>
                  <div className="flex items-center gap-3 mt-1">
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
                      aria-describedby="invoice-prefix-hint"
                      aria-errormessage="invoice-prefix-error"
                      aria-invalid={prefixBlurred && !isPrefixValid ? 'true' : undefined}
                      onBlur={() => setPrefixBlurred(true)}
                      onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                      className={`w-36 font-mono uppercase ${
                        prefixBlurred && !isPrefixValid ? 'user-invalid-fallback' : ''
                      }`}
                    />
                    <div className="rounded bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 font-mono">
                      {previewNumber}
                    </div>
                  </div>
                  <p
                    id="invoice-prefix-error"
                    className={`text-xs text-rose-600 font-medium mt-1 ${
                      prefixBlurred && !isPrefixValid ? 'block' : 'field-error-msg'
                    }`}
                  >
                    Must be 2–6 uppercase alphanumeric characters.
                  </p>
                </div>

                <div>
                  <Label htmlFor="defaultCurrency" className="text-xs font-semibold text-slate-800">
                    Default Currency
                  </Label>
                  <Select
                    value={defaultCurrency}
                    onValueChange={(val) => setDefaultCurrency(val as SupportedCurrency)}
                  >
                    <SelectTrigger id="defaultCurrency" className="mt-1">
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

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-800">
                    Default Invoice Template Language
                  </Label>
                  <div className="flex gap-3 mt-1.5">
                    <Button
                      type="button"
                      variant={defaultLanguage === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDefaultLanguage('en')}
                      className="text-xs font-medium"
                    >
                      English (EN)
                    </Button>
                    <Button
                      type="button"
                      variant={defaultLanguage === 'id' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDefaultLanguage('id')}
                      className="text-xs font-medium"
                    >
                      Bahasa Indonesia (ID)
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Bank Payment Instructions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bank Details & Payment Terms
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Appears on the payment instructions section of every invoice.
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
                    placeholder="BCA, Mandiri, BNI"
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
                    placeholder="1234567890"
                    className="mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="accountHolder" className="text-xs text-slate-600">
                    Account Holder Name
                  </Label>
                  <Input
                    id="accountHolder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="PT Acme Creative"
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor="bankNotes" className="text-xs text-slate-600">
                    Payment Instructions / Transfer Notes
                  </Label>
                  <Input
                    id="bankNotes"
                    value={bankNotes}
                    onChange={(e) => setBankNotes(e.target.value)}
                    placeholder="Payment is due within 14 days of invoice issue date."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSaving || !isPrefixValid}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-6 shadow-xs"
              >
                {isSaving ? 'Saving Changes...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* UU PDP Compliance & Account Deletion Notice (D-58, NFR-3) */}
      <Card className="border-slate-200/80 bg-slate-50 shadow-none">
        <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
          <Shield className="h-5 w-5 text-slate-600 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-semibold text-slate-800">
              Personal Data Protection (UU PDP No. 27/2022) & Account Deletion
            </h4>
            <p>
              In compliance with Indonesia&apos;s Personal Data Protection Law (UU PDP), you have the right to access, export, or permanently delete your account and invoice data.
            </p>
            <p className="pt-1 flex items-center gap-1.5 font-medium text-slate-700">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>For manual account erasure or data inquiries, contact: </span>
              <a
                href="mailto:support@tagiva.com"
                className="text-primary hover:underline font-semibold"
              >
                support@tagiva.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
