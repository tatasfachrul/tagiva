import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Wrench } from 'lucide-react';
import { MaintenanceStatus } from './components/maintenance-status';

export function MaintenancePage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans text-slate-900 antialiased selection:bg-[#004ac6] selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <TagivaLogo size="md" href="/" priority />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span>Under Maintenance</span>
          </div>
        </div>
      </header>

      {/* Main Maintenance Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-xl text-center space-y-8">
          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm mx-auto">
                <Wrench className="h-10 w-10 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Headings */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              System Maintenance Underway
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
              We are currently carrying out scheduled system maintenance to enhance stability, security, and performance.
            </p>
            <p className="text-xs text-slate-400">
              Pemeliharaan sistem sedang berlangsung. Kami akan segera kembali online.
            </p>
          </div>

          {/* Live Status and Refresh */}
          <MaintenanceStatus />

          {/* Support Note */}
          <div className="pt-8 border-t border-slate-200/80">
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Urgent question regarding an active invoice? Contact our operations support at{' '}
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
