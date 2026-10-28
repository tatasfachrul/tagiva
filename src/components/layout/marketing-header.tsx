'use client';

/**
 * Tagiva - Marketing Header Component (D-47, D-59, D-60)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo (32x32px lockup per DESIGN_SYSTEM.md Section 3.4) */}
        <div className="flex items-center gap-8">
          <TagivaLogo size="md" href="/" priority={true} />
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground"
          >
            <Link href="/#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#sample" className="hover:text-foreground transition-colors">
              A4 Template & Entitlements
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
        </div>

        {/* Right CTA & Bilingual Indicator (D-47) */}
        <div className="hidden sm:flex items-center gap-3">
          <span
            className="rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-mono font-semibold text-muted-foreground"
            title="Supports English (EN) and Bahasa Indonesia (ID)"
          >
            EN | ID
          </span>
          <Button asChild variant="ghost" size="sm" className="text-xs font-medium text-foreground">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="text-xs font-semibold shadow-2xs">
            <Link href="/login?next=/invoices/new">Sign in with Google</Link>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-white px-4 py-4 sm:hidden flex flex-col gap-3">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-foreground">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="/#sample"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              A4 Template & Entitlements
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-primary"
            >
              FAQ
            </Link>
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="w-full text-xs font-semibold">
              <Link href="/login?next=/invoices/new">Sign in with Google</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
