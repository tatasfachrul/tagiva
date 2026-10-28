'use client';

/**
 * Tagiva - Public Invoice Client Toolbar
 *
 * Provides:
 * - Client-facing status badge (Unpaid, Paid, Overdue, D-43)
 * - Direct PDF download trigger (/api/public/i/[token]/pdf)
 * - 1-click Copy Bank Account button with clipboard feedback
 */

import React, { useState } from 'react';
import { Download, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getInvoiceDictionary } from '@/lib/i18n/invoice-dictionary';
import type { InvoiceTemplateData } from '@/components/invoice-templates';
import type { InvoiceStatus } from '@/lib/domain/status';

interface PublicInvoiceToolbarProps {
  invoice: InvoiceTemplateData;
  token: string;
}

export function PublicInvoiceToolbar({ invoice, token }: PublicInvoiceToolbarProps) {
  const [hasCopiedAccount, setHasCopiedAccount] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const dict = getInvoiceDictionary(invoice.language);
  const pdfDownloadUrl = `/api/public/i/${token}/pdf`;

  const statusKey = (invoice.status || 'sent') as InvoiceStatus;

  // Status configuration following D-43
  const statusConfigRecord: Record<InvoiceStatus, { label: string; className: string }> = {
    sent: {
      label: dict.statusBadges.unpaid,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    paid: {
      label: dict.statusBadges.paid,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    overdue: {
      label: dict.statusBadges.overdue,
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    draft: {
      label: 'DRAFT',
      className: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const statusConfig = statusConfigRecord[statusKey] ?? statusConfigRecord.sent;

  const accountNumber = invoice.paymentInstructions?.accountNumber?.trim();
  const bankName = invoice.paymentInstructions?.bankName?.trim();

  async function handleCopyAccountNumber() {
    if (!accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountNumber);
      setHasCopiedAccount(true);
      toast.success(
        bankName
          ? `${bankName} account number copied: ${accountNumber}`
          : `Account number copied: ${accountNumber}`,
      );
      setTimeout(() => setHasCopiedAccount(false), 2000);
    } catch {
      toast.error('Failed to copy account number.');
    }
  }

  function handleDownloadPdf() {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = pdfDownloadUrl;
    link.download = `${invoice.invoiceNumber || 'Invoice'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 1500);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Branding & Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-bold tracking-tight text-slate-900">
              Tagiva
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-mono text-xs font-semibold text-slate-600">
              {invoice.invoiceNumber || '[DRAFT]'}
            </span>
          </div>

          <Badge
            variant="outline"
            className={`text-[11px] font-semibold px-2 py-0.5 uppercase tracking-wider ${statusConfig.className}`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Right: Actions (Copy Bank Account, Download PDF) */}
        <div className="flex items-center gap-2">
          {accountNumber && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyAccountNumber}
              className="text-xs h-8 text-slate-700 border-slate-200 hover:bg-slate-50"
              title={bankName ? `Copy ${bankName} account` : 'Copy account number'}
            >
              {hasCopiedAccount ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
              ) : (
                <CreditCard className="h-3.5 w-3.5 text-slate-500 mr-1.5" />
              )}
              <span className="hidden sm:inline">
                {hasCopiedAccount
                  ? 'Copied!'
                  : bankName
                    ? `Copy ${bankName}`
                    : 'Copy Bank Account'}
              </span>
              <span className="sm:hidden">
                {hasCopiedAccount ? 'Copied' : 'Account'}
              </span>
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="text-xs h-8 bg-slate-900 text-white hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
