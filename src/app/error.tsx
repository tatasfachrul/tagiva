'use client';

/**
 * Tagiva - Global Route Error Boundary
 *
 * Catches unhandled errors in route segments and presents a user-friendly,
 * non-technical fallback screen. Logs internal errors to the console without
 * leaking stack traces or system messages to end users.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log internal error for diagnostics; never render raw message in UI
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md border-slate-200/80 shadow-sm bg-white text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex justify-center">
            <TagivaLogo size="lg" className="rounded-xl shadow-xs" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
            We encountered an unexpected problem while loading this page. Please try again or return to the dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
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
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
