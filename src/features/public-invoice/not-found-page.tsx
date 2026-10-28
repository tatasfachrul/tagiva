import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Tagiva - Public Invoice 404 / Revoked Link Page
 *
 * Implements:
 * - UX_FLOWS.md Section 4: "This invoice link is no longer active or does not exist. Please contact the sender directly."
 * - SEC-PUB-4: Instant revocation 404
 * - NFR-2: No stack traces or user metadata leaked
 */
export function PublicInvoiceNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md text-center bg-white p-8 rounded-xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FileQuestion className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900">
            Invoice Link Inactive
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            This invoice link is no longer active or does not exist. Please contact the sender directly.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/" className="inline-flex items-center gap-1.5 text-slate-600">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Tagiva</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
