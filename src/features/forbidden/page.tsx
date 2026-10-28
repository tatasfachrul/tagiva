import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, LayoutDashboard, ArrowLeft, LogIn } from 'lucide-react';

export function ForbiddenPage() {
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

      {/* Main 403 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-xl text-center space-y-8">
          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm mx-auto">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <span className="absolute -bottom-2 -right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
                403
              </span>
            </div>
          </div>

          {/* Headings */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Access Forbidden
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
              You don’t have permission to view or access this page. This resource might require elevated privileges or a different account.
            </p>
            <p className="text-xs text-slate-400">
              Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              asChild
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm font-medium h-11 px-6 rounded-lg"
            >
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-medium h-11 px-6 rounded-lg"
            >
              <Link href="/login" className="inline-flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Switch Account / Sign In</span>
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

          {/* Security Note */}
          <div className="pt-8 border-t border-slate-200/80">
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you believe you should have access to this page, please contact your workspace administrator or reach out to{' '}
              <a href="mailto:support@tagiva.com" className="text-blue-600 underline font-medium">
                support@tagiva.com
              </a>.
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
