'use client';

/**
 * Tagiva - Global Route Error Boundary
 *
 * Catches unhandled errors in route segments and presents a user-friendly,
 * non-technical fallback screen. Logs internal errors to the console without
 * leaking stack traces or system messages to end users.
 */

import { useEffect } from 'react';
import { ErrorView } from '@/features/server-error';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log internal error for diagnostics; never render raw message in UI
    console.error('Unhandled application error:', error);
  }, [error]);

  return <ErrorView error={error} reset={reset} />;
}
