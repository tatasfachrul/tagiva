'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';

interface ErrorViewProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

export function ErrorView({ error, reset }: ErrorViewProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleReset = () => {
    if (!reset) return;
    setIsRetrying(true);
    try {
      reset();
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans text-slate-900 antialiased selection:bg-[#004ac6] selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <TagivaLogo size="md" href="/" priority />
          <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main 500 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-xl text-center space-y-8">
          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm mx-auto">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <span className="absolute -bottom-2 -right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                500
              </span>
            </div>
          </div>

          {/* Headings */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Internal Server Error
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
              We encountered an unexpected problem while processing this request. Our engineering team has been notified.
            </p>
            <p className="text-xs text-slate-400">
              Terjadi kesalahan pada sistem. Silakan muat ulang atau coba lagi beberapa saat lagi.
            </p>
          </div>

          {/* Diagnostic Code (Digest) */}
          {error?.digest && (
            <div className="inline-block px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
              Error ID: <span className="text-slate-900 font-semibold">{error.digest}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {reset ? (
              <Button
                type="button"
                onClick={handleReset}
                disabled={isRetrying}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm font-medium h-11 px-6 rounded-lg inline-flex items-center gap-2"
              >
                <RotateCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm font-medium h-11 px-6 rounded-lg inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reload Page</span>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium h-11 px-6 rounded-lg"
            >
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="w-full sm:w-auto text-slate-600 hover:text-slate-900 font-medium h-11 px-6 rounded-lg"
            >
              <Link href="/" className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Return Home</span>
              </Link>
            </Button>
          </div>

          {/* Support Note */}
          <div className="pt-8 border-t border-slate-200/80">
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If this error persists, please reach out to our team at{' '}
              <a href="mailto:support@tagiva.com" className="text-blue-600 underline font-medium">
                support@tagiva.com
              </a>{' '}
              and quote the Error ID above.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Tagiva (tagiva.com). All rights reserved.</p>
      </footer>
    </div>
  );
}
