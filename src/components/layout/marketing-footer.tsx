import React from 'react';
import Link from 'next/link';
import { TagivaLogo } from '@/components/layout/tagiva-logo';

export function MarketingFooter() {
  return (
    <footer className="w-full bg-[#eff4ff] shadow-[0_1px_8px_rgba(0,0,0,0.02)] border-t border-[#dce9ff] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TagivaLogo size="sm" href="/" />
            </div>
            <p className="text-sm text-[#434655] max-w-xs leading-relaxed">
              Modern, compliant invoicing engineered for Indonesian freelancers, agencies, and agile businesses.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <div className="text-sm font-semibold text-[#0b1c30] mb-3">Product</div>
            <ul className="space-y-2 text-sm text-[#434655]">
              <li>
                <a href="#features" className="hover:text-[#0b1c30] transition-colors">
                  Overview &amp; Features
                </a>
              </li>
              <li>
                <Link href="/login?next=/invoices/new" className="hover:text-[#0b1c30] transition-colors">
                  Live ISO A4 Editor
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#0b1c30] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing-matrix" className="hover:text-[#0b1c30] transition-colors">
                  Plans &amp; Tier Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div>
            <div className="text-sm font-semibold text-[#0b1c30] mb-3">Compliance &amp; Legal</div>
            <ul className="space-y-2 text-sm text-[#434655]">
              <li>
                <Link href="/privacy" className="hover:text-[#0b1c30] transition-colors">
                  UU PDP No. 27/2022 Compliance
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#0b1c30] transition-colors">
                  Data Residency &amp; Security
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#0b1c30] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#0b1c30] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-sm font-semibold text-[#0b1c30] mb-3">Resources</div>
            <ul className="space-y-2 text-sm text-[#434655]">
              <li>
                <a href="mailto:support@tagiva.com" className="hover:text-[#0b1c30] transition-colors">
                  Documentation &amp; API
                </a>
              </li>
              <li>
                <a href="mailto:support@tagiva.com" className="hover:text-[#0b1c30] transition-colors">
                  Indonesian Banking Guides
                </a>
              </li>
              <li>
                <a href="mailto:support@tagiva.com" className="hover:text-[#0b1c30] transition-colors">
                  Tax Invoice (e-Faktur) Notes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#dce9ff] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#434655]">
          <span>© 2025 PT Tagiva Digital Nusantara. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2e6100]" aria-hidden="true" />
              <span>ISO A4 Standard Compatible</span>
            </span>
            <span>DKI Jakarta, Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
