'use client';

/**
 * Tagiva - Dashboard Invoices Filter Hook & Pure Filter Functions
 *
 * Implements client-side search and status tab filtering (FR-5.2, FR-5.3).
 */

import { useState, useMemo } from 'react';
import type { DashboardFilterStatus, DashboardInvoiceItem } from '../types';

export function computeDashboardCounts(invoices: readonly DashboardInvoiceItem[]) {
  const counts = {
    all: invoices.length,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
  };

  for (const inv of invoices) {
    if (inv.status === 'draft') counts.draft++;
    else if (inv.status === 'sent') counts.sent++;
    else if (inv.status === 'paid') counts.paid++;
    else if (inv.status === 'overdue') counts.overdue++;
  }

  return counts;
}

export function filterDashboardInvoices(
  invoices: readonly DashboardInvoiceItem[],
  activeTab: DashboardFilterStatus,
  searchQuery: string,
): DashboardInvoiceItem[] {
  const query = searchQuery.trim().toLowerCase();

  return invoices.filter((inv) => {
    // 1. Status tab check
    if (activeTab !== 'all' && inv.status !== activeTab) {
      return false;
    }

    // 2. Search query check
    if (query) {
      const numberMatch = inv.invoiceNumber?.toLowerCase().includes(query);
      const nameMatch = inv.clientName.toLowerCase().includes(query);
      const companyMatch = inv.clientCompany?.toLowerCase().includes(query);
      return Boolean(numberMatch || nameMatch || companyMatch);
    }

    return true;
  });
}

export function useDashboardFilters(invoices: DashboardInvoiceItem[]) {
  const [activeTab, setActiveTab] = useState<DashboardFilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => computeDashboardCounts(invoices), [invoices]);
  const filteredInvoices = useMemo(
    () => filterDashboardInvoices(invoices, activeTab, searchQuery),
    [invoices, activeTab, searchQuery],
  );

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    counts,
    filteredInvoices,
  };
}
