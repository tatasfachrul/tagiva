/**
 * Tagiva - Login Page (Feature Module)
 *
 * Implements:
 * - Google Sign-in gate (D-14, D-24, D-31)
 * - Tagiva 48x48px brand logo (D-60)
 * - Passing ?next= through PKCE code exchange
 * - Terms & Privacy links
 */

import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleSignInButton } from './components/google-sign-in-button';

export interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'Sign-in could not be completed. Please try again.',
  missing_code: 'Authentication session expired. Please sign in again.',
  config_missing: 'Authentication service is temporarily unavailable. Please try again later.',
  access_denied: 'Sign-in was canceled. Please try again when ready.',
};

export async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next;
  const errorCode = params.error;

  const errorMessage = errorCode
    ? AUTH_ERROR_MESSAGES[errorCode] ?? 'An error occurred during authentication. Please try again.'
    : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md border-slate-200/80 shadow-sm bg-white">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="flex justify-center">
            <TagivaLogo size="lg" className="rounded-xl shadow-xs" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to Tagiva
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
            Simple, fast, and compliant invoicing for Indonesian businesses and freelancers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          {errorMessage && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-center">
              <p className="text-xs text-rose-700 font-medium">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <GoogleSignInButton nextPath={nextPath} />

            <p className="text-xs text-center text-slate-500 leading-relaxed px-2">
              By continuing, you agree to Tagiva&apos;s{' '}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
