'use client';

/**
 * Tagiva - Interactive Landing Teaser & Visitor Gate (D-24, D-31, A-22)
 *
 * Implements:
 * - D-24, D-31: Visitors CANNOT generate or preview PDFs unauthenticated.
 * - A-22: Form entries saved in sessionStorage ('tagiva_landing_draft')
 *   and restored when user lands on /invoices/new after Google sign-in.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Sparkles, Lock, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

export function InteractiveTeaser() {
  const router = useRouter();
  const [clientName, setClientName] = useState('PT Mahakarya Digital');
  const [description, setDescription] = useState('Brand Identity & UI/UX Design');
  const [amount, setAmount] = useState('15000000');
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleCreateOrPreview(e: React.FormEvent) {
    e.preventDefault();
    setIsRedirecting(true);

    try {
      // Save visitor draft to sessionStorage for restoration upon login (A-22)
      const draftPayload = {
        clientName: clientName.trim(),
        description: description.trim(),
        unitPrice: Number(amount) || 0,
        currency: 'IDR',
        language: 'en',
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tagiva_landing_draft', JSON.stringify(draftPayload));
      }

      toast.info('Sign in with Google to preview and save your invoice.');
      router.push('/login?next=/invoices/new');
    } catch {
      router.push('/login');
    }
  }

  return (
    <div className="relative mx-auto max-w-4xl rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 mb-2">
            <Sparkles className="h-3 w-3" />
            Try It Now
          </span>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
            Start typing your invoice right here
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your client and item details. We&apos;ll save your inputs and take you directly to your invoice.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/60">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          <span>Google Sign-In required to issue</span>
        </div>
      </div>

      <form onSubmit={handleCreateOrPreview} className="pt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="teaserClient" className="text-xs font-semibold text-slate-700">
              Billed To (Client Name)
            </Label>
            <Input
              id="teaserClient"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client Name or Company"
              className="text-xs font-sans h-9"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="teaserDesc" className="text-xs font-semibold text-slate-700">
              Service / Item Description
            </Label>
            <Input
              id="teaserDesc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Website Development"
              className="text-xs font-sans h-9"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="teaserAmount" className="text-xs font-semibold text-slate-700">
              Amount (IDR)
            </Label>
            <Input
              id="teaserAmount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="15000000"
              className="text-xs font-mono h-9"
              required
            />
          </div>
        </div>

        {/* Live Calculation Mini Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 rounded-lg p-3 text-xs border border-slate-200/60">
          <div className="flex items-center gap-4 text-slate-600">
            <div>
              <span className="text-slate-400">Subtotal:</span>{' '}
              <strong className="text-slate-900 font-mono">
                Rp{Number(amount || 0).toLocaleString('id-ID')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">PPN (11%):</span>{' '}
              <strong className="text-slate-900 font-mono">
                Rp{Math.round(Number(amount || 0) * 0.11).toLocaleString('id-ID')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Total:</span>{' '}
              <strong className="text-slate-900 font-mono">
                Rp{Math.round(Number(amount || 0) * 1.11).toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isRedirecting}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold h-8 px-4"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            <span>{isRedirecting ? 'Redirecting...' : 'Preview & Create Invoice'}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
        <span className="inline-flex items-center gap-1">
          <Check className="h-3 w-3 text-emerald-500" /> Free 3 saved invoices
        </span>
        <span className="inline-flex items-center gap-1">
          <Check className="h-3 w-3 text-emerald-500" /> No credit card needed
        </span>
        <span className="inline-flex items-center gap-1">
          <Check className="h-3 w-3 text-emerald-500" /> Preserves your draft across sign-in
        </span>
      </div>
    </div>
  );
}
