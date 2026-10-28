/**
 * Tagiva - Dashboard Feature Types
 */

import type { SupportedCurrency } from '@/lib/domain/calculations';
import type { InvoiceStatus } from '@/lib/domain/status';
import type { UserPlanState } from '@/lib/domain/entitlements';

export type DashboardFilterStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';

export interface DashboardInvoiceItem {
  id: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  originalStatus: 'draft' | 'sent' | 'paid';
  clientName: string;
  clientCompany?: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  currency: SupportedCurrency;
  createdAt: string;
}

export interface DashboardSummary {
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  overdueCount: number;
  draftCount: number;
  totalCount: number;
  primaryCurrency: SupportedCurrency;
}

export interface DashboardPageData {
  invoices: DashboardInvoiceItem[];
  summary: DashboardSummary;
  planState: UserPlanState;
  userEmail?: string;
}
