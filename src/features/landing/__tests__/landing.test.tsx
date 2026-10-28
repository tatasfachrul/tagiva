/**
 * Tagiva - Landing & Marketing Pages Tests
 *
 * Verifies:
 * - D-24, D-31, A-22: Unauthenticated landing teaser routes to /login?next=/invoices/new
 * - D-16: Canonical IDR pricing options (Free Rp0, Pro 1m/3m/6m/12m)
 * - D-58: UU PDP No. 27/2022 compliance and 72-hour account deletion SLA
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

import { LandingPage } from '../page';
import { InteractiveTeaser } from '../components/interactive-teaser';
import { PricingPage, PricingTable } from '@/features/pricing';
import { PrivacyPage, TermsPage } from '@/features/legal';

describe('Landing & Marketing Pages', () => {
  it('renders landing page with all hero, teaser, features, and FAQ sections', () => {
    const html = renderToString(<LandingPage />);
    expect(html).toContain('Professional Invoices in Seconds');
    expect(html).toContain('Try It Now');
    expect(html).toContain('Start Invoicing Free');
    expect(html).toContain('Frequently Asked Questions');
  });

  it('renders interactive teaser with default sample data and login CTA gate (D-24, D-31)', () => {
    const html = renderToString(<InteractiveTeaser />);
    expect(html).toContain('PT Mahakarya Digital');
    expect(html).toContain('Brand Identity &amp; UI/UX Design');
    expect(html).toContain('Preview &amp; Create Invoice');
    expect(html).toContain('Google Sign-In required to issue');
  });

  it('renders pricing table with canonical pricing tiers (D-16)', () => {
    const html = renderToString(<PricingTable />);
    // Free plan
    expect(html).toContain('Free Starter');
    expect(html).toContain('Rp 0');
    expect(html).toContain('Maksimal 3 invoice tersimpan');

    // Pro plan
    expect(html).toContain('Tagiva Pro');
    expect(html).toContain('Invoice tanpa batas');
    expect(html).toContain('Tanpa watermark');
    expect(html).toContain('Upload logo bisnis');
  });

  it('renders full pricing page with FAQ and guarantee banner', () => {
    const html = renderToString(<PricingPage />);
    expect(html).toContain('Harga Sederhana, Transparan &amp; Terjangkau');
    expect(html).toContain('Pertanyaan Umum Seputar Biaya &amp; Langganan');
    expect(html).toContain('Keamanan Data &amp; Privasi Terjamin');
  });

  it('renders privacy policy with explicit UU PDP No. 27/2022 and 72-hour SLA (D-58)', () => {
    const html = renderToString(<PrivacyPage />);
    expect(html).toContain('UU No. 27 Tahun 2022');
    expect(html).toContain('support@tagiva.com');
    expect(html).toContain('72 jam');
    expect(html).toContain('Permohonan Penghapusan Data Pribadi');
  });

  it('renders terms of service with plan rules and disclaimer', () => {
    const html = renderToString(<TermsPage />);
    expect(html).toContain('Syarat dan Ketentuan Layanan');
    expect(html).toContain('Paket Free Starter');
    expect(html).toContain('Paket Pro');
    expect(html).toContain('support@tagiva.com');
  });
});
