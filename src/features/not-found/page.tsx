import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
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

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-xl text-center space-y-8">
          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm mx-auto">
                <FileQuestion className="h-10 w-10" />
              </div>
              <span className="absolute -bottom-2 -right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#1B3668] text-white shadow-xs">
                404
              </span>
            </div>
          </div>

          {/* Headings */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Page Not Found
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
              We couldn’t find the page you’re looking for. It might have been moved, deleted, or the URL might have a typo.
            </p>
            <p className="text-xs text-slate-400">
              Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.
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
              <Link href="/" className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Return to Home</span>
              </Link>
            </Button>
          </div>

          {/* Quick Helpful Links */}
          <div className="pt-8 border-t border-slate-200/80">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
              Helpful Destinations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
              <Link href="/pricing" className="hover:text-blue-600 hover:underline">
                Pricing & Plans
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/terms" className="hover:text-blue-600 hover:underline">
                Terms of Service
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/privacy" className="hover:text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
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
