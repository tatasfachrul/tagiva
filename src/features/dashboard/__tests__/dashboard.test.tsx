/**
 * Tagiva - Dashboard Feature Tests
 *
 * Verifies:
 * - FR-5.1: Summary calculations (Paid, Outstanding, Overdue)
 * - FR-5.2: Status filtering tabs (All, Draft, Sent, Paid, Overdue)
 * - FR-5.3: Search filtering by client name and invoice number
 * - D-30: [DRAFT] rendering
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

import {
  computeDashboardCounts,
  filterDashboardInvoices,
} from '../hooks/use-dashboard-filters';
import { InvoiceSummaryCards } from '../components/invoice-summary-cards';
import { InvoiceListTable } from '../components/invoice-list-table';
import type { DashboardInvoiceItem, DashboardSummary } from '../types';

const MOCK_INVOICES: DashboardInvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: null,
    status: 'draft',
    originalStatus: 'draft',
    clientName: 'Alpha Corp',
    clientCompany: 'Alpha Inc',
    issueDate: '2026-10-28',
    dueDate: '2026-11-11',
    totalAmount: 5000000,
    currency: 'IDR',
    createdAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-TAG-2026-10-0001',
    status: 'sent',
    originalStatus: 'sent',
    clientName: 'Beta Studio',
    issueDate: '2026-10-25',
    dueDate: '2026-11-08',
    totalAmount: 12000000,
    currency: 'IDR',
    createdAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-TAG-2026-10-0002',
    status: 'paid',
    originalStatus: 'paid',
    clientName: 'Gamma Media',
    issueDate: '2026-10-20',
    dueDate: '2026-11-03',
    totalAmount: 25000000,
    currency: 'IDR',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-TAG-2026-09-0001',
    status: 'overdue',
    originalStatus: 'sent',
    clientName: 'Delta Labs',
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    totalAmount: 8000000,
    currency: 'IDR',
    createdAt: '2026-09-10T10:00:00Z',
  },
];

const MOCK_SUMMARY: DashboardSummary = {
  totalPaid: 25000000,
  totalOutstanding: 12000000,
  totalOverdue: 8000000,
  overdueCount: 1,
  draftCount: 1,
  totalCount: 4,
  primaryCurrency: 'IDR',
};

describe('Dashboard Filtering & Counts (FR-5.2, FR-5.3)', () => {
  it('computes tab counts accurately across statuses', () => {
    const counts = computeDashboardCounts(MOCK_INVOICES);

    expect(counts.all).toBe(4);
    expect(counts.draft).toBe(1);
    expect(counts.sent).toBe(1);
    expect(counts.paid).toBe(1);
    expect(counts.overdue).toBe(1);
  });

  it('filters invoices when changing active tab', () => {
    const paidList = filterDashboardInvoices(MOCK_INVOICES, 'paid', '');
    expect(paidList.length).toBe(1);
    expect(paidList[0]?.clientName).toBe('Gamma Media');

    const draftList = filterDashboardInvoices(MOCK_INVOICES, 'draft', '');
    expect(draftList.length).toBe(1);
    expect(draftList[0]?.clientName).toBe('Alpha Corp');

    const overdueList = filterDashboardInvoices(MOCK_INVOICES, 'overdue', '');
    expect(overdueList.length).toBe(1);
    expect(overdueList[0]?.clientName).toBe('Delta Labs');
  });

  it('filters invoices by search query (client name, company, and invoice number)', () => {
    const byClient = filterDashboardInvoices(MOCK_INVOICES, 'all', 'beta');
    expect(byClient.length).toBe(1);
    expect(byClient[0]?.clientName).toBe('Beta Studio');

    const byCompany = filterDashboardInvoices(MOCK_INVOICES, 'all', 'Alpha Inc');
    expect(byCompany.length).toBe(1);
    expect(byCompany[0]?.clientName).toBe('Alpha Corp');

    const byNumber = filterDashboardInvoices(MOCK_INVOICES, 'all', 'INV-TAG-2026-09');
    expect(byNumber.length).toBe(1);
    expect(byNumber[0]?.clientName).toBe('Delta Labs');

    const none = filterDashboardInvoices(MOCK_INVOICES, 'all', 'non-existent');
    expect(none.length).toBe(0);
  });
});

describe('Dashboard Summary Cards (InvoiceSummaryCards — FR-5.1)', () => {
  it('renders summary figures with formatted currencies', () => {
    const html = renderToString(
      React.createElement(InvoiceSummaryCards, { summary: MOCK_SUMMARY }),
    );

    expect(html).toContain('Total Received');
    expect(html).toContain('Rp25.000.000');
    expect(html).toContain('Outstanding');
    expect(html).toContain('Rp12.000.000');
    expect(html).toContain('Overdue');
    expect(html).toContain('Rp8.000.000');
    expect(html).toContain('All Invoices');
    expect(html).toContain('4');
  });
});

describe('Dashboard Invoice List Table (InvoiceListTable — FR-5.4, D-30)', () => {
  it('renders literal [DRAFT] placeholder for draft invoices (D-30)', () => {
    const html = renderToString(
      React.createElement(InvoiceListTable, {
        invoices: MOCK_INVOICES,
        planState: 'free',
      }),
    );

    expect(html).toContain('[DRAFT]');
    expect(html).toContain('INV-TAG-2026-10-0001');
    expect(html).toContain('Alpha Corp');
    expect(html).toContain('Gamma Media');
  });

  it('renders empty state when there are 0 invoices (UX_FLOWS.md Section 4)', () => {
    const html = renderToString(
      React.createElement(InvoiceListTable, {
        invoices: [],
        planState: 'free',
      }),
    );

    expect(html).toContain('You haven&#x27;t created any invoices yet');
    expect(html).toContain('Create Your First Invoice');
  });
});
