'use client';

/**
 * Tagiva - Root Global Error Boundary
 *
 * Handles critical root layout failures with a standalone fallback UI.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Fatal root error:', error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 font-sans antialiased"
      >
        <div className="w-full max-w-md bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <TagivaLogo size="lg" className="rounded-xl shadow-xs" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Application Error
          </h1>
          <p className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
            A temporary issue prevented this page from loading. Please try again or return home.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto"
            >
              Try again
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-slate-300"
            >
              <Link href="/">
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
