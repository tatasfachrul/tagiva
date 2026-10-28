'use client';

/**
 * Tagiva - Marketing Header Component (Stitch Redesign)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Menu, X } from 'lucide-react';

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e5eeff] transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <TagivaLogo size="md" href="/" priority={true} />
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#434655]"
          >
            <Link
              href="/#features"
              className="hover:text-[#0b1c30] transition-colors py-1 px-2 rounded"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-[#0b1c30] transition-colors py-1 px-2 rounded"
            >
              How It Works
            </Link>
            <Link
              href="/#testimonials"
              className="hover:text-[#0b1c30] transition-colors py-1 px-2 rounded"
            >
              Stories
            </Link>
            <Link
              href="/pricing"
              className={`transition-colors py-1 px-2 rounded ${
                pathname === '/pricing' ? 'text-[#004ac6] font-semibold' : 'hover:text-[#0b1c30]'
              }`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right CTA & Bilingual Indicator */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="inline-flex items-center p-0.5 rounded-full bg-[#e5eeff]">
            <button
              type="button"
              className="px-2.5 py-0.5 rounded-full bg-white text-xs font-semibold text-[#0b1c30] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              EN
            </button>
            <button
              type="button"
              className="px-2.5 py-0.5 rounded-full text-xs font-medium text-[#434655] hover:text-[#0b1c30] transition-colors"
            >
              ID
            </button>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#2563eb] text-white text-sm font-semibold shadow-sm hover:bg-[#004ac6] transition-all active:scale-[0.99]"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#434655] hover:text-[#0b1c30]"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#e5eeff] bg-white px-4 py-4 sm:hidden flex flex-col gap-3">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-[#0b1c30]">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#004ac6]"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#004ac6]"
            >
              How It Works
            </Link>
            <Link
              href="/#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#004ac6]"
            >
              Stories
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-1 ${
                pathname === '/pricing' ? 'text-[#004ac6] font-semibold' : 'hover:text-[#004ac6]'
              }`}
            >
              Pricing
            </Link>
          </nav>
          <div className="pt-3 border-t border-[#e5eeff] flex items-center justify-between gap-2">
            <div className="inline-flex items-center p-0.5 rounded-full bg-[#e5eeff]">
              <button
                type="button"
                className="px-2.5 py-0.5 rounded-full bg-white text-xs font-semibold text-[#0b1c30] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                EN
              </button>
              <button
                type="button"
                className="px-2.5 py-0.5 rounded-full text-xs font-medium text-[#434655]"
              >
                ID
              </button>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#2563eb] text-white text-sm font-semibold shadow-sm hover:bg-[#004ac6] transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
