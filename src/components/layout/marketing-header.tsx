'use client';

/**
 * Tagiva - Marketing Header Component (D-59, D-60)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <TagivaLogo size="md" href="/" />
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link
              href="/#features"
              className="hover:text-slate-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:text-slate-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              className="hover:text-slate-900 transition-colors"
            >
              FAQ
            </Link>
          </nav>
        </div>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-xs font-medium text-slate-700">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs">
            <Link href="/login" className="inline-flex items-center gap-1.5">
              <span>Start Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:hidden space-y-3">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-slate-700">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-slate-900"
            >
              FAQ
            </Link>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="w-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold">
              <Link href="/login">Start Free (3 Invoices)</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
