'use client';

/**
 * Tagiva - Interactive Split-Screen Invoice Builder
 *
 * Implements:
 * - Desktop 50/50 split vs Mobile segmented tab toggle (DESIGN_SYSTEM.md Section 5.2)
 * - Saved client picker (FR-5.11)
 * - PPN 11% quick chip (D-44)
 * - Discount % vs Fixed toggle (D-45)
 * - Currency (D-32, D-46) & Language selectors (D-17)
 * - Lapsed read-only mode (D-23, D-28)
 */

import React, { useState } from 'react';
import {
  Building2,
  FileText,
  Percent,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUPPORTED_CURRENCIES } from '@/lib/domain/calculations';
import { ModernMinimalistWebPreview } from '@/components/invoice-templates';
import { InvoiceActionBar } from './invoice-action-bar';
import { useInvoiceBuilder } from '../hooks/use-invoice-builder';
import type { InvoiceWithDetails, ClientOption } from '../types';
import type { ProfileRow } from '@/types/database';
import type { UserPlanState } from '@/lib/domain/entitlements';

interface InvoiceBuilderProps {
  initialInvoice?: InvoiceWithDetails | null;
  profile?: ProfileRow | null;
  planState: UserPlanState;
  savedClients?: ClientOption[];
  isReadOnly?: boolean;
}

export function InvoiceBuilder({
  initialInvoice,
  profile,
  planState,
  savedClients = [],
  isReadOnly = false,
}: InvoiceBuilderProps) {
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const {
    values,
    previewData,
    isSaving,
    handleChange,
    addItem,
    removeItem,
    updateItem,
    selectClient,
    togglePpn11,
    saveDraft,
  } = useInvoiceBuilder({
    initialInvoice,
    profile,
    planState,
  });

  const showFooter = planState !== 'pro';

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Top Action Bar */}
      <InvoiceActionBar
        invoiceId={initialInvoice?.id}
        status={initialInvoice?.status ?? 'draft'}
        planState={planState}
        isReadOnly={isReadOnly}
        onSaveDraft={saveDraft}
        isSaving={isSaving}
      />

      {/* Lapsed Read-Only Notification Banner (D-28) */}
      {isReadOnly && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-center justify-between">
          <span>
            <strong>Read-Only Mode:</strong> Your Pro subscription has ended. Existing invoices cannot be edited, but you can still mark them as Paid or download PDFs.
          </span>
        </div>
      )}

      {/* Mobile Tab Segmented Toggle (DESIGN_SYSTEM.md 5.2) */}
      <div className="lg:hidden p-3 bg-white border-b border-slate-200">
        <Tabs
          value={mobileTab}
          onValueChange={(val) => setMobileTab(val as 'form' | 'preview')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="text-xs">
              Edit Form
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Live Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Workspace: Desktop 50/50 Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* ================= LEFT COLUMN: FORM EDITOR ================= */}
        <div
          className={`overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-2xl mx-auto w-full ${
            mobileTab === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Section 1: Settings & Dates */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Invoice Settings
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Language</Label>
                <Select
                  value={values.language}
                  onValueChange={(v) => handleChange('language', v as 'en' | 'id')}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="h-9 mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (EN)</SelectItem>
                    <SelectItem value="id">Bahasa Indonesia (ID)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Currency</Label>
                <Select
                  value={values.currency}
                  onValueChange={(v) => handleChange('currency', v as typeof values.currency)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="h-9 mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Issue Date</Label>
                <Input
                  type="date"
                  value={values.issueDate}
                  onChange={(e) => handleChange('issueDate', e.target.value)}
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={values.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Client Details ("Billed To") */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Billed To (Client)
                </h3>
              </div>

              {/* Saved Client Picker (FR-5.11) */}
              {savedClients.length > 0 && !isReadOnly && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <Select
                    onValueChange={(id) => {
                      const c = savedClients.find((item) => item.id === id);
                      if (c) selectClient(c);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs border-slate-200">
                      <SelectValue placeholder="Pick saved client" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.company ? `(${client.company})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Client Contact Name *</Label>
                <Input
                  value={values.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Company Name (Optional)</Label>
                <Input
                  value={values.clientCompany}
                  onChange={(e) => handleChange('clientCompany', e.target.value)}
                  placeholder="e.g. Acme Corp"
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Client Email</Label>
                <Input
                  type="email"
                  value={values.clientEmail}
                  onChange={(e) => handleChange('clientEmail', e.target.value)}
                  placeholder="client@company.com"
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Client Billing Address</Label>
                <Input
                  value={values.clientAddress}
                  onChange={(e) => handleChange('clientAddress', e.target.value)}
                  placeholder="City, Country"
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>
            </div>

            {!isReadOnly && !values.customerId && (
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.saveCustomerToDirectory}
                  onChange={(e) =>
                    handleChange('saveCustomerToDirectory', e.target.checked)
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Save client to directory for future invoices (UX-A02)
              </label>
            )}
          </div>

          {/* Section 3: Line Items */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Line Items
                </h3>
              </div>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {values.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex-1 w-full">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, 'description', e.target.value)
                      }
                      placeholder={`Item description #${idx + 1}`}
                      disabled={isReadOnly}
                      className="h-9 text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        step="any"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="Qty"
                        disabled={isReadOnly}
                        className="h-9 text-xs text-right tabular-nums bg-white"
                      />
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice || ''}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="Unit Price"
                        disabled={isReadOnly}
                        className="h-9 text-xs text-right tabular-nums bg-white"
                      />
                    </div>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove line item ${idx + 1}`}
                        className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Discount & Taxes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Discounts & Taxes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Discount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Discount</Label>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1 rounded bg-slate-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleChange('discountType', 'percent')}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                          values.discountType === 'percent'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('discountType', 'fixed')}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                          values.discountType === 'fixed'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        Fixed
                      </button>
                    </div>
                  )}
                </div>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={values.discountValue || ''}
                  onChange={(e) =>
                    handleChange('discountValue', parseFloat(e.target.value) || 0)
                  }
                  placeholder={values.discountType === 'percent' ? '10%' : 'Amount'}
                  disabled={isReadOnly}
                  className="h-9 text-xs tabular-nums"
                />
              </div>

              {/* Tax */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Tax (PPN)</Label>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={togglePpn11}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded border ${
                        values.taxRate === 11
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Percent className="h-3 w-3" />
                      PPN 11%
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={values.taxLabel}
                    onChange={(e) => handleChange('taxLabel', e.target.value)}
                    placeholder="Label (e.g. PPN)"
                    disabled={isReadOnly}
                    className="h-9 w-24 text-xs"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={values.taxRate || ''}
                    onChange={(e) =>
                      handleChange('taxRate', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Rate %"
                    disabled={isReadOnly}
                    className="h-9 flex-1 text-xs text-right tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Payment Instructions & Notes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Payment Instructions & Notes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Bank Name</Label>
                <Input
                  value={values.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="e.g. BCA, Mandiri"
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Account Number</Label>
                <Input
                  value={values.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  placeholder="e.g. 1234567890"
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs tabular-nums"
                />
              </div>
              <div>
                <Label className="text-xs">Account Holder Name</Label>
                <Input
                  value={values.accountHolder}
                  onChange={(e) => handleChange('accountHolder', e.target.value)}
                  placeholder="e.g. PT Acme Indonesia"
                  disabled={isReadOnly}
                  className="h-9 mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Terms & Notes (Optional)</Label>
              <Textarea
                value={values.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Payment terms, bank branch, or thank you note..."
                disabled={isReadOnly}
                className="mt-1 text-xs h-20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: STICKY A4 LIVE PREVIEW ================= */}
        <div
          className={`overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100 flex items-start justify-center ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:flex'
          }`}
        >
          <div className="sticky top-6 w-full max-w-[794px]">
            <ModernMinimalistWebPreview
              invoice={previewData}
              showFooter={showFooter}
              className="transform origin-top scale-90 sm:scale-95 lg:scale-100 transition-all shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
