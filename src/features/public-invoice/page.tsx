import React from 'react';
import { notFound } from 'next/navigation';
import { getPublicInvoiceByToken } from './queries/public-invoice-queries';
import { PublicInvoiceToolbar } from './components/public-invoice-toolbar';
import { ModernMinimalistWebPreview } from '@/components/invoice-templates';

interface PublicInvoicePageProps {
  params: Promise<{ token: string }>;
}

/**
 * Tagiva - Public Invoice View (/i/[token])
 *
 * Implements:
 * - SEC-PUB-2: Scoped lookup via get_public_invoice_by_token
 * - SEC-PUB-3: Robots exclusion headers / metadata
 * - SEC-PUB-4: Immediate 404 if token is disabled or invalid
 * - D-40: Viewable by client with platform footer if sender is Lapsed
 * - D-41: Inter typography
 * - D-43: Client status badges (Unpaid, Paid, Overdue)
 */
export async function PublicInvoicePage({ params }: PublicInvoicePageProps) {
  const { token } = await params;
  const result = await getPublicInvoiceByToken(token);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-900 flex flex-col">
      <PublicInvoiceToolbar invoice={result.invoice} token={token} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start overflow-x-auto">
        <div className="w-full max-w-[794px] shadow-lg rounded-md overflow-hidden bg-white">
          <ModernMinimalistWebPreview
            invoice={result.invoice}
            showFooter={result.showPlatformFooter}
          />
        </div>
      </main>
    </div>
  );
}
