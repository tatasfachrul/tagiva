import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { WaitlistForm } from './components/waitlist-form';
import { FeatureHighlights } from './components/feature-highlights';

export function ComingSoonPage() {
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

      {/* Main Coming Soon Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-3xl text-center space-y-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            <span>Tagiva Launch — Coming Soon</span>
          </div>

          {/* Headline & Subhead */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Modern Invoicing for Indonesian Freelancers & SMEs
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We’re putting the finishing touches on Tagiva. Experience ultra-fast ISO A4 invoice creation, automated Rupiah tax math, and direct bank transfer instructions.
            </p>
            <p className="text-xs text-slate-400">
              Segera hadir: platform penagihan faktur profesional dan cepat untuk bisnis & pekerja lepas di Indonesia.
            </p>
          </div>

          {/* Waitlist / Notify Box */}
          <div className="max-w-lg mx-auto w-full pt-2">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900">
                  Get notified when we open early access
                </h2>
                <p className="text-xs text-slate-500">
                  Be among the first to experience zero-friction invoicing in Indonesia.
                </p>
              </div>
              <WaitlistForm />
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-4 pt-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              What you can expect
            </p>
            <FeatureHighlights />
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
