/**
 * Tagiva - Marketing Footer Component (D-58, D-59)
 */

import React from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <TagivaLogo size="md" href="/" />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Fast, modern invoicing designed for Indonesian freelancers, agencies, and boutique studios.
              Accurate PPN 11% calculations, sequential numbering, and clean client delivery.
            </p>
            <div className="text-[11px] text-slate-400">
              Evaluated in WIB (UTC+07:00) • Strictly UU PDP No. 27/2022 compliant.
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/#features" className="hover:text-slate-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-900 transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/#sample" className="hover:text-slate-900 transition-colors">
                  Invoice Template
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Sign In with Google
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy Links (D-58) */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/terms" className="hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Policy (UU PDP)
                </Link>
              </li>
              <li>
                <Link href="/privacy#account-deletion" className="hover:text-slate-900 transition-colors">
                  Account Data Deletion
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@tagiva.com"
                  className="hover:text-slate-900 transition-colors text-slate-500"
                >
                  support@tagiva.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 2026 Tagiva (tagiva.com). All rights reserved.</p>
          <p className="text-[11px]">
            No credit card required for 3 free invoices. No guest cookies or device trackers.
          </p>
        </div>
      </div>
    </footer>
  );
}
