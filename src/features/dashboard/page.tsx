import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDashboardData } from './queries/dashboard-queries';
import { InvoiceSummaryCards } from './components/invoice-summary-cards';
import { InvoiceListTable } from './components/invoice-list-table';

export async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect('/login?next=/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track, filter, and manage your billing, payments, and client invoices.
          </p>
        </div>

        <div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs">
            <Link href="/invoices/new">
              <Plus className="h-4 w-4 mr-1.5" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <InvoiceSummaryCards summary={data.summary} />

      {/* Invoices List Table */}
      <InvoiceListTable
        invoices={data.invoices}
        planState={data.planState}
      />
    </div>
  );
}
