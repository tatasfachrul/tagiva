'use client';

/**
 * Tagiva - Single MVP Invoice Template ("Modern Minimalist") — Web Preview
 *
 * Implements:
 * - A4 geometry (logical 794px × 1123px base, 96 DPI, D-03, D-36)
 * - Exclusive Inter typography with tabular-nums (D-41)
 * - Strict [DRAFT] rendering (D-30, D-42)
 * - Bilingual labels EN/ID (D-17)
 * - Status badges (D-43)
 * - Retained logo on Lapsed invoices (D-27)
 * - Platform footer on Free & Lapsed (D-11, D-28, D-40, FR-7.3)
 */

import React from 'react';
import { formatCurrency } from '@/lib/domain/calculations';
import {
  formatInvoiceDate,
  getInvoiceDictionary,
} from '@/lib/i18n/invoice-dictionary';
import { cn } from '@/lib/utils';
import type { InvoiceRenderProps } from '../types';

export function ModernMinimalistWebPreview({
  invoice,
  showFooter = false,
  className,
}: InvoiceRenderProps) {
  const dict = getInvoiceDictionary(invoice.language);
  const isDraft = invoice.status === 'draft' || !invoice.invoiceNumber;

  // Status badge config
  const statusBadgeConfig = {
    draft: {
      label: 'DRAFT',
      className: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    sent: {
      label: dict.statusBadges.unpaid,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    paid: {
      label: dict.statusBadges.paid,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    overdue: {
      label: dict.statusBadges.overdue,
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  }[invoice.status] ?? {
    label: 'DRAFT',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const hasDiscount = (invoice.discountAmount ?? 0) > 0;
  const hasTax = (invoice.taxRate ?? 0) > 0 || (invoice.taxAmount ?? 0) > 0;
  const hasPaymentDetails = Boolean(
    invoice.paymentInstructions?.bankName ||
      invoice.paymentInstructions?.accountNumber ||
      invoice.paymentInstructions?.accountHolder,
  );

  return (
    <div
      data-testid="invoice-web-preview"
      lang={invoice.language}
      className={cn(
        'relative mx-auto flex w-full max-w-[794px] flex-col justify-between bg-white p-10 sm:p-12 shadow-sm ring-1 ring-slate-200 text-slate-900 font-invoice transition-all',
        'min-h-[1123px] [aspect-ratio:1/1.4142]',
        className,
      )}
    >
      <div>
        {/* ================= HEADER ZONE ================= */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Left: Logo & Sender Details */}
          <div className="flex-1 space-y-2">
            {invoice.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={invoice.logoUrl}
                alt={invoice.senderName ? `${invoice.senderName} Logo` : 'Business Logo'}
                width={180}
                height={64}
                decoding="async"
                className="max-h-16 max-w-[180px] object-contain object-left mb-3"
              />
            ) : null}

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {invoice.senderName || 'Your Business Name'}
              </h2>
              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                {invoice.senderAddress && (
                  <p className="whitespace-pre-line leading-relaxed">{invoice.senderAddress}</p>
                )}
                {invoice.senderEmail && <p>{invoice.senderEmail}</p>}
                {invoice.senderPhone && <p>{invoice.senderPhone}</p>}
                {invoice.senderTaxId && (
                  <p className="tabular-nums">
                    NPWP / Tax ID: {invoice.senderTaxId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Document Title & Number / [DRAFT] */}
          <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
              {dict.documentTitle}
            </h1>

            {/* Invoice Number or [DRAFT] box */}
            {isDraft ? (
              <div
                data-testid="invoice-draft-badge"
                className="mt-1.5 inline-flex items-center rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-semibold tracking-wider text-slate-700"
              >
                {dict.draftPlaceholder}
              </div>
            ) : (
              <p
                data-testid="invoice-number"
                className="mt-1 text-sm font-semibold text-slate-800 tabular-nums"
              >
                {invoice.invoiceNumber}
              </p>
            )}

            {/* Status Badge */}
            <div className="mt-2">
              <span
                data-testid="invoice-status-badge"
                className={cn(
                  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
                  statusBadgeConfig.className,
                )}
              >
                {statusBadgeConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* ================= RECIPIENT & METADATA ZONE ================= */}
        <div className="mt-8 grid grid-cols-12 gap-6 border-t border-slate-100 pt-6">
          {/* Billed To (60% / 7 cols) */}
          <div className="col-span-12 sm:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {dict.billedToLabel}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {invoice.clientName || 'Client Name'}
            </p>
            {invoice.clientCompany && (
              <p className="mt-0.5 text-xs font-medium text-slate-700">
                {invoice.clientCompany}
              </p>
            )}
            <div className="mt-1 space-y-0.5 text-xs text-slate-600">
              {invoice.clientAddress && (
                <p className="whitespace-pre-line leading-relaxed">{invoice.clientAddress}</p>
              )}
              {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
            </div>
          </div>

          {/* Metadata (40% / 5 cols) */}
          <div className="col-span-12 sm:col-span-5 sm:text-right">
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between sm:justify-end sm:gap-4">
                <dt className="text-slate-500 font-medium">{dict.issueDateLabel}:</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  {formatInvoiceDate(invoice.issueDate, invoice.language) || '—'}
                </dd>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-4">
                <dt className="text-slate-500 font-medium">{dict.dueDateLabel}:</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  {formatInvoiceDate(invoice.dueDate, invoice.language) || '—'}
                </dd>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-4">
                <dt className="text-slate-500 font-medium">Currency:</dt>
                <dd className="font-semibold text-slate-900 tabular-nums">
                  {invoice.currency}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* ================= LINE ITEMS TABLE ================= */}
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <caption className="visually-hidden">
              {dict.documentTitle} line items
            </caption>
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th scope="col" className="w-8 py-2.5 pl-3 pr-1 text-center">
                  #
                </th>
                <th scope="col" className="py-2.5 px-3">
                  {dict.colDescription}
                </th>
                <th scope="col" className="w-16 py-2.5 px-2 text-right tabular-nums">
                  {dict.colQty}
                </th>
                <th scope="col" className="w-28 py-2.5 px-2 text-right tabular-nums">
                  {dict.colUnitPrice}
                </th>
                <th scope="col" className="w-28 py-2.5 pl-2 pr-3 text-right tabular-nums">
                  {dict.colAmount}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No line items added yet.
                  </td>
                </tr>
              ) : (
                invoice.items.map((item, idx) => (
                  <tr key={item.id ?? idx} className="hover:bg-slate-50/50">
                    <td className="py-3 pl-3 pr-1 text-center text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 whitespace-pre-line leading-relaxed">
                      {item.description || 'Item description'}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-800 tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-800 tabular-nums">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-3 pl-2 pr-3 text-right font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(item.lineTotal, invoice.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= TOTALS BLOCK ================= */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-xs">
            {/* Subtotal */}
            <div className="flex justify-between py-1 text-slate-600">
              <span className="font-medium">{dict.subtotalLabel}</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>

            {/* Discount (hidden if 0) */}
            {hasDiscount && (
              <div className="flex justify-between py-1 text-emerald-700">
                <span className="font-medium">
                  {dict.discountLabel}
                  {invoice.discountType === 'percent' && invoice.discountValue
                    ? ` (${invoice.discountValue}%)`
                    : ''}
                </span>
                <span className="font-semibold tabular-nums">
                  -{formatCurrency(invoice.discountAmount ?? 0, invoice.currency)}
                </span>
              </div>
            )}

            {/* Tax (hidden if 0) */}
            {hasTax && (
              <div className="flex justify-between py-1 text-slate-600">
                <span className="font-medium">
                  {invoice.taxLabel || 'PPN'}
                  {invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(invoice.taxAmount ?? 0, invoice.currency)}
                </span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between border-t-2 border-slate-900 pt-2.5 text-slate-900">
              <span className="text-sm font-bold">{dict.totalLabel}</span>
              <span
                data-testid="invoice-grand-total"
                className="text-base font-bold tabular-nums"
              >
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ================= PAYMENT INSTRUCTIONS & NOTES ================= */}
        <div className="mt-8 border-t border-slate-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Payment Instructions */}
          {hasPaymentDetails && (
            <div className="space-y-1.5 text-xs">
              <p className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                {dict.paymentInstructionsLabel}
              </p>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1">
                {invoice.paymentInstructions?.bankName && (
                  <p className="text-slate-700">
                    <span className="text-slate-500 font-medium">{dict.bankNameLabel}: </span>
                    <span className="font-semibold">{invoice.paymentInstructions.bankName}</span>
                  </p>
                )}
                {invoice.paymentInstructions?.accountNumber && (
                  <p className="text-slate-700">
                    <span className="text-slate-500 font-medium">{dict.accountNoLabel}: </span>
                    <span className="font-semibold tabular-nums">
                      {invoice.paymentInstructions.accountNumber}
                    </span>
                  </p>
                )}
                {invoice.paymentInstructions?.accountHolder && (
                  <p className="text-slate-700">
                    <span className="text-slate-500 font-medium">{dict.accountHolderLabel}: </span>
                    <span className="font-semibold">
                      {invoice.paymentInstructions.accountHolder}
                    </span>
                  </p>
                )}
                {invoice.paymentInstructions?.notes && (
                  <p className="mt-1 text-[11px] text-slate-500 italic">
                    {invoice.paymentInstructions.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes / Terms */}
          {invoice.notes ? (
            <div className="space-y-1.5 text-xs">
              <p className="font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                {dict.notesLabel}
              </p>
              <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                {invoice.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* ================= PLATFORM FOOTER ================= */}
      {showFooter && (
        <div
          data-testid="invoice-platform-footer"
          className="mt-12 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500"
        >
          {dict.platformFooter}
        </div>
      )}
    </div>
  );
}
