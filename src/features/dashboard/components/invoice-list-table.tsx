'use client';

/**
 * Tagiva - Dashboard Invoice List Table
 *
 * Implements:
 * - Status filter tabs (All, Draft, Sent, Paid, Overdue, FR-5.2)
 * - Search bar by number, client, company (FR-5.3)
 * - Accessible status badges with icons (DESIGN_SYSTEM.md 3.3, DS-A11Y-3)
 * - Row actions menu with role-aware disabled states & tooltips (D-28, D-29)
 * - Empty states (UX_FLOWS.md Section 4)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileEdit,
  FileText,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/domain/calculations';
import { formatInvoiceDate } from '@/lib/i18n/invoice-dictionary';
import { cn } from '@/lib/utils';
import {
  updateInvoiceStatusAction,
  deleteInvoiceAction,
  duplicateInvoiceAction,
} from '@/features/invoices/actions';
import { useDashboardFilters } from '../hooks/use-dashboard-filters';
import type { DashboardInvoiceItem, DashboardFilterStatus } from '../types';
import type { UserPlanState } from '@/lib/domain/entitlements';
import { toast } from 'sonner';

interface InvoiceListTableProps {
  invoices: DashboardInvoiceItem[];
  planState: UserPlanState;
}

export function InvoiceListTable({ invoices, planState }: InvoiceListTableProps) {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    counts,
    filteredInvoices,
  } = useDashboardFilters(invoices);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const isFree = planState === 'free';
  const isLapsed = planState === 'lapsed';

  // Status badge config
  const statusBadgeMap = {
    draft: {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: FileEdit,
    },
    sent: {
      label: 'Sent',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Send,
    },
    paid: {
      label: 'Paid',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    overdue: {
      label: 'Overdue',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
    },
  };

  // Status update handler
  async function handleStatusChange(invoiceId: string, targetStatus: 'sent' | 'paid') {
    setActionInProgress(invoiceId);
    try {
      const res = await updateInvoiceStatusAction({ invoiceId, targetStatus });
      if (res.ok) {
        toast.success(
          targetStatus === 'paid' ? 'Marked as Paid!' : 'Status reverted to Sent.',
        );
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setActionInProgress(null);
    }
  }

  // Duplicate handler
  async function handleDuplicate(invoiceId: string) {
    setActionInProgress(invoiceId);
    try {
      const res = await duplicateInvoiceAction({ invoiceId });
      if (res.ok) {
        toast.success('Invoice duplicated as Draft!');
        router.push(`/invoices/${res.data.newInvoiceId}`);
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to duplicate invoice.');
    } finally {
      setActionInProgress(null);
    }
  }

  // Delete handler
  async function handleDelete() {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteInvoiceAction({ invoiceId: deletingId });
      if (res.ok) {
        toast.success('Invoice deleted.');
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to delete invoice.');
    } finally {
      setIsDeleting(false);
    }
  }

  // 1. Overall Empty State (0 total invoices)
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          You haven&apos;t created any invoices yet
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Create, customize, and issue clean professional invoices in seconds with live preview.
        </p>
        <div className="mt-6">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs">
            <Link href="/invoices/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Your First Invoice
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'All', count: counts.all },
                { id: 'draft', label: 'Draft', count: counts.draft },
                { id: 'sent', label: 'Sent', count: counts.sent },
                { id: 'paid', label: 'Paid', count: counts.paid },
                { id: 'overdue', label: 'Overdue', count: counts.overdue },
              ] as Array<{ id: DashboardFilterStatus; label: string; count: number }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums',
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700',
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client or #"
              className="h-8.5 pl-8 pr-8 text-xs bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Invoice Table or Filtered Empty State */}
        {filteredInvoices.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
            <p className="text-sm font-semibold text-slate-900">
              No invoices match your filter
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your status tab or clearing the search keyword.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="py-3 px-4">
                      Invoice
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Client
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Issue Date
                    </th>
                    <th scope="col" className="py-3 px-4">
                      Due Date
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      Amount
                    </th>
                    <th scope="col" className="py-3 px-4 text-center">
                      Status
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => {
                    const badge = statusBadgeMap[invoice.status];
                    const BadgeIcon = badge.icon;
                    const isDraft = invoice.status === 'draft';
                    const isPaid = invoice.status === 'paid';
                    const isSentOrOverdue =
                      invoice.status === 'sent' || invoice.status === 'overdue';

                    // Deletion entitlement check (D-21, D-28, D-29)
                    const canDeleteRow =
                      planState === 'pro' || (planState === 'free' && isDraft);

                    return (
                      <tr
                        key={invoice.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Invoice Number / [DRAFT] */}
                        <td className="py-3 px-4 font-medium">
                          {isDraft ? (
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="inline-flex items-center rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-slate-700 hover:bg-slate-100"
                            >
                              [DRAFT]
                            </Link>
                          ) : (
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="font-semibold text-slate-900 tabular-nums hover:text-blue-600"
                            >
                              {invoice.invoiceNumber}
                            </Link>
                          )}
                        </td>

                        {/* Client Info */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">
                            {invoice.clientName || 'Untitled Client'}
                          </p>
                          {invoice.clientCompany && (
                            <p className="text-[11px] text-slate-500">
                              {invoice.clientCompany}
                            </p>
                          )}
                        </td>

                        {/* Issue Date */}
                        <td className="py-3 px-4 tabular-nums text-slate-600">
                          {formatInvoiceDate(invoice.issueDate) || '—'}
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-4 tabular-nums text-slate-600">
                          {formatInvoiceDate(invoice.dueDate) || '—'}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                              badge.className,
                            )}
                          >
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </span>
                        </td>

                        {/* Row Actions Menu */}
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-900"
                                aria-label="Open invoice actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                              {/* View / Edit */}
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/invoices/${invoice.id}`}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                                  <span>{isLapsed ? 'View Details' : 'View / Edit'}</span>
                                </Link>
                              </DropdownMenuItem>

                              {/* Download PDF */}
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/api/invoices/${invoice.id}/pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Download className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Download PDF</span>
                                </a>
                              </DropdownMenuItem>

                              {/* Duplicate */}
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(invoice.id)}
                                disabled={actionInProgress === invoice.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                <span>Duplicate</span>
                              </DropdownMenuItem>

                              {/* Mark as Paid (enabled for Lapsed too, D-28) */}
                              {isSentOrOverdue && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(invoice.id, 'paid')}
                                  disabled={actionInProgress === invoice.id}
                                  className="flex items-center gap-2 text-emerald-700 font-medium cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Mark as Paid</span>
                                </DropdownMenuItem>
                              )}

                              {/* Undo Paid (revert to sent - Free/Pro only) */}
                              {isPaid && !isLapsed && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(invoice.id, 'sent')}
                                  disabled={actionInProgress === invoice.id}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Undo Paid</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {/* Delete Action with Role-Aware Tooltip */}
                              {canDeleteRow ? (
                                <DropdownMenuItem
                                  onClick={() => setDeletingId(invoice.id)}
                                  className="flex items-center gap-2 text-rose-600 focus:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="px-2 py-1.5 text-slate-400 cursor-not-allowed flex items-center gap-2">
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="text-xs max-w-xs">
                                    {isFree
                                      ? 'Sent, Overdue, and Paid invoices cannot be deleted on the Free plan.'
                                      : 'Existing invoices cannot be deleted on lapsed accounts.'}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice?
              {isFree && ' Deleting a draft will restore 1 Free invoice slot.'} This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
