/**
 * Tagiva - Marketing Footer Component (D-58, D-59, D-60)
 */

import React from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <TagivaLogo size="md" href="/" />
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Modern invoicing for Indonesian freelancers and small businesses. Create, manage, and send professional A4 invoices with PDF generation, shareable client links, and automated numbering.
            </p>
            <div className="text-[11px] font-mono text-muted-foreground">
              Asia/Jakarta (WIB, UTC+07:00) • UU PDP No. 27/2022 compliant
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-foreground">Product</h4>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Features & Lifecycle
                </Link>
              </li>
              <li>
                <Link href="/#sample" className="hover:text-foreground transition-colors">
                  A4 Template & Entitlements
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans (Rp29k – Rp250k)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Sign in with Google
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy Links (D-58) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-foreground">Legal & Support</h4>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy (UU PDP)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Account Data Deletion (72h SLA)
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@tagiva.com"
                  className="hover:text-foreground transition-colors font-mono"
                >
                  support@tagiva.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <p>© 2026 Tagiva (tagiva.com). All rights reserved.</p>
          <p className="text-[11px] font-mono">
            Made with Tagiva • tagiva.com
          </p>
        </div>
      </div>
    </footer>
  );
}
