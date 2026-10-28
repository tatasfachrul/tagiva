'use client';

/**
 * Tagiva - Dashboard Summary Cards
 *
 * Implements summary metrics per FR-5.1:
 * - Total Paid
 * - Total Outstanding
 * - Total Overdue
 * - Total Invoices / Drafts
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/domain/calculations';
import type { DashboardSummary } from '../types';

interface InvoiceSummaryCardsProps {
  summary: DashboardSummary;
}

export function InvoiceSummaryCards({ summary }: InvoiceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Paid */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Received
            </p>
            <p className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(summary.totalPaid, summary.primaryCurrency)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Collected to date</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Outstanding */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Outstanding
            </p>
            <p className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(summary.totalOutstanding, summary.primaryCurrency)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Awaiting payment</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Overdue */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Overdue
            </p>
            <p className="mt-1.5 text-xl font-bold text-rose-600 tabular-nums">
              {formatCurrency(summary.totalOverdue, summary.primaryCurrency)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {summary.overdueCount} {summary.overdueCount === 1 ? 'invoice' : 'invoices'} past due
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Total Invoices / Drafts */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              All Invoices
            </p>
            <p className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
              {summary.totalCount}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {summary.draftCount} {summary.draftCount === 1 ? 'draft' : 'drafts'} in progress
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <FileText className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
