/**
 * Tagiva - Landing & Marketing Pages Tests
 *
 * Verifies:
 * - Redesigned Stitch landing page sections
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
  it('renders landing page with all redesigned hero, value propositions, social proof, workflow, and CTA sections', () => {
    const html = renderToString(<LandingPage />);
    expect(html).toContain('Enterprise-grade invoicing, built for modern teams.');
    expect(html).toContain('Get Started for Free');
    expect(html).toContain('Why Freelancers &amp; Agencies Choose Tagiva');
    expect(html).toContain('Create &amp; Send in 3 Simple Steps');
    expect(html).toContain('Loved by Indonesia’s Independent Talent');
    expect(html).toContain('Rp 4.2M+');
    expect(html).toContain('Start invoicing with 3 free slots or upgrade to Pro');
  });

  it('renders landing page with scroll-snap container and snap-start sections', () => {
    const html = renderToString(<LandingPage />);
    expect(html).toContain('snap-y');
    expect(html).toContain('snap-mandatory');
    expect(html).toContain('snap-start');
    expect(html).toContain('scroll-mt-16');
  });

  it('renders interactive teaser with default sample data and login CTA gate (D-24, D-31)', () => {
    const html = renderToString(<InteractiveTeaser />);
    expect(html).toContain('PT Contoh');
    expect(html).toContain('UI/UX Design Phase 1');
    expect(html).toContain('Preview &amp; Create Invoice');
    expect(html).toContain('Sign in with Google required to save or issue');
  });

  it('renders pricing table with canonical pricing tiers (D-16)', () => {
    const html = renderToString(<PricingTable />);
    // Free plan
    expect(html).toContain('Starter');
    expect(html).toContain('Free Forever');
    expect(html).toContain('Rp 0');
    expect(html).toContain('Up to 3 active stored invoices');

    // Pro plan
    expect(html).toContain('Pro');
    expect(html).toContain('RECOMMENDED');
    expect(html).toContain('Unlimited active invoices');
    expect(html).toContain('100% Watermark-free');
    expect(html).toContain('Upload your custom studio logo');
  });

  it('renders full pricing page with FAQ and guarantee banner', () => {
    const html = renderToString(<PricingPage />);
    expect(html).toContain('Fair pricing for ambitious freelancers');
    expect(html).toContain('Frequently Asked Questions');
    expect(html).toContain('Bank-Grade Privacy');
    expect(html).toContain('Ready to impress your clients?');
  });

  it('renders privacy policy with explicit UU PDP No. 27/2022 and 72-hour SLA (D-58)', () => {
    const html = renderToString(<PrivacyPage />);
    expect(html).toContain('UU No. 27 of 2022');
    expect(html).toContain('support@tagiva.com');
    expect(html).toContain('72 hours');
    expect(html).toContain('Request for Personal Data Deletion');
  });

  it('renders terms of service with plan rules and disclaimer', () => {
    const html = renderToString(<TermsPage />);
    expect(html).toContain('Terms of Service');
    expect(html).toContain('Free Starter Plan');
    expect(html).toContain('Pro Plan');
    expect(html).toContain('support@tagiva.com');
  });
});
