import React from 'react';
import { MarketingHeader } from '@/components/layout/marketing-header';
import { MarketingFooter } from '@/components/layout/marketing-footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9ff] font-sans text-[#0b1c30] antialiased selection:bg-[#004ac6] selection:text-white">
      <a
        href="#marketing-main"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-md bg-[#004ac6] px-3 py-1.5 text-xs font-semibold text-white shadow-md"
      >
        Skip to main content
      </a>
      <MarketingHeader />
      <main id="marketing-main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
