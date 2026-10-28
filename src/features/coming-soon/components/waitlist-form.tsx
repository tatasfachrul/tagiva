'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Mail, Loader2, ArrowRight } from 'lucide-react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Simulate quick registration / analytics capture
    setTimeout(() => {
      setStatus('success');
    }, 700);
  };

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 text-center shadow-xs">
        <div className="flex items-center justify-center gap-2 text-emerald-800 font-semibold mb-1">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>You’re on the priority list!</span>
        </div>
        <p className="text-xs text-emerald-700">
          Terima kasih. Kami akan memberi tahu Anda segera saat Tagiva resmi diluncurkan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="Enter your work email..."
            className="pl-10 h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 rounded-lg text-sm"
            disabled={status === 'loading'}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm whitespace-nowrap inline-flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>Notify Me</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {status === 'error' && (
        <p className="text-xs text-rose-600 font-medium text-center">{errorMessage}</p>
      )}

      <p className="text-xs text-slate-400 text-center">
        No spam, ever. Unsubscribe at any time.
      </p>
    </form>
  );
}
