import React from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';

export function MarketingFooter() {
  return (
    <footer className="w-full bg-[#eff4ff] border-t border-[#dce9ff] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#dce9ff]">
          {/* Brand Info */}
          <div className="flex flex-col gap-2 max-w-sm">
            <TagivaLogo size="sm" href="/" />
            <p className="text-sm text-[#434655] leading-relaxed">
              Simple, professional invoicing for Indonesian freelancers and small businesses.
            </p>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[#434655]"
          >
            <a href="#features" className="hover:text-[#0b1c30] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#0b1c30] transition-colors">
              How It Works
            </a>
            <Link href="/pricing" className="hover:text-[#0b1c30] transition-colors">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-[#0b1c30] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#0b1c30] transition-colors">
              Privacy
            </Link>
            <a href="mailto:support@tagiva.com" className="hover:text-[#0b1c30] transition-colors">
              Contact
            </a>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#565e74]">
          <p>© {new Date().getFullYear()} Tagiva. All rights reserved.</p>
          <p>Made for Indonesian freelancers &amp; small businesses</p>
        </div>
      </div>
    </footer>
  );
}
