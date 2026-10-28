'use client';

/**
 * Tagiva - Invoice Action Bar
 *
 * Implements:
 * - Save Draft, Issue / Mark as Sent with UX-A03 Free confirmation popover
 * - Mark as Paid (enabled for Lapsed users too, D-28)
 * - Pro-badged Share Link and Send Email triggers (D-11)
 * - Free delete restrictions (D-29)
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Send,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import {
  issueInvoiceAction,
  updateInvoiceStatusAction,
  deleteInvoiceAction,
} from '../actions';
import { ShareLinkModal } from './share-link-modal';
import { SendEmailModal } from './send-email-modal';
import type { InvoiceStatus } from '@/lib/domain/status';
import type { UserPlanState } from '@/lib/domain/entitlements';
import { toast } from 'sonner';

interface InvoiceActionBarProps {
  invoiceId?: string;
  invoiceNumber?: string | null;
  clientEmail?: string;
  clientName?: string;
  senderName?: string;
  language?: 'en' | 'id';
  status: InvoiceStatus;
  planState: UserPlanState;
  isReadOnly?: boolean;
  onSaveDraft?: () => Promise<void>;
  isSaving?: boolean;
}

export function InvoiceActionBar({
  invoiceId,
  invoiceNumber,
  clientEmail = '',
  clientName = '',
  senderName = '',
  language = 'en',
  status,
  planState,
  isReadOnly = false,
  onSaveDraft,
  isSaving = false,
}: InvoiceActionBarProps) {
  const router = useRouter();
  const [isIssuing, setIsIssuing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const isDraft = status === 'draft';
  const isPaid = status === 'paid';
  const isSentOrOverdue = status === 'sent' || status === 'overdue';
  const isPro = planState === 'pro';
  const isFree = planState === 'free';
  const isLapsed = planState === 'lapsed';

  // Handle Issue Invoice
  async function handleIssue() {
    if (!invoiceId) return;
    setIsIssuing(true);
    try {
      const res = await issueInvoiceAction({ invoiceId });
      if (res.ok) {
        toast.success(`Invoice issued successfully: ${res.data.invoiceNumber}`);
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to issue invoice.');
    } finally {
      setIsIssuing(false);
    }
  }

  // Handle Mark as Paid
  async function handleStatusChange(targetStatus: 'sent' | 'paid') {
    if (!invoiceId) return;
    setIsUpdatingStatus(true);
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
      setIsUpdatingStatus(false);
    }
  }

  // Handle Delete Invoice
  async function handleDelete() {
    if (!invoiceId) return;
    setIsDeleting(true);
    try {
      const res = await deleteInvoiceAction({ invoiceId });
      if (res.ok) {
        toast.success('Invoice deleted.');
        router.push('/dashboard');
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to delete invoice.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }


  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        {/* Left: Status Indicator & Delete button */}
        <div className="flex items-center gap-2">
          {invoiceId && (
            <>
              {isFree && !isDraft ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-slate-400 cursor-not-allowed hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Sent, Overdue, and Paid invoices cannot be deleted on the Free plan.
                  </TooltipContent>
                </Tooltip>
              ) : isLapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-slate-400 cursor-not-allowed hover:bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Existing invoices cannot be deleted on lapsed accounts.
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pro Action 1: Share Link */}
          {invoiceId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isPro) {
                  setShareModalOpen(true);
                } else {
                  setUpgradeModalOpen(true);
                }
              }}
              className="text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4 mr-1.5 text-slate-500" />
              Share Link
              {!isPro && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 text-[10px] px-1.5 py-0"
                >
                  PRO
                </Badge>
              )}
            </Button>
          )}

          {/* Pro Action 2: Send Email */}
          {invoiceId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isPro) {
                  setEmailModalOpen(true);
                } else {
                  setUpgradeModalOpen(true);
                }
              }}
              className="text-slate-700 hover:bg-slate-50"
            >
              <Send className="h-4 w-4 mr-1.5 text-slate-500" />
              Send Email
              {!isPro && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 text-[10px] px-1.5 py-0"
                >
                  PRO
                </Badge>
              )}
            </Button>
          )}

          {/* Download PDF */}
          {invoiceId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="text-slate-700 hover:bg-slate-50"
            >
              <a
                href={`/api/invoices/${invoiceId}/pdf`}
                download
                target="_blank"
                rel="noreferrer"
              >
                <Download className="h-4 w-4 mr-1.5 text-slate-500" />
                Download PDF
              </a>
            </Button>
          )}

          {/* Save Draft Button (hidden if read-only) */}
          {!isReadOnly && onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="border-slate-300 font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
          )}

          {/* Issue / Mark as Sent Button (for Draft) */}
          {isDraft && invoiceId && !isReadOnly && (
            <>
              {isFree ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isIssuing}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
                    >
                      {isIssuing ? 'Issuing...' : 'Issue & Mark as Sent'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 text-xs space-y-3">
                    <p className="font-semibold text-slate-900">
                      Confirm Invoice Issuance
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Issuing this invoice will assign its permanent sequential number.
                      <strong className="block mt-1 text-amber-700">
                        Note: On the Free plan, Sent invoices cannot be deleted.
                      </strong>
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleIssue}
                        disabled={isIssuing}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isIssuing ? 'Issuing...' : 'Confirm & Issue'}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleIssue}
                  disabled={isIssuing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
                >
                  {isIssuing ? 'Issuing...' : 'Issue & Mark as Sent'}
                </Button>
              )}
            </>
          )}

          {/* Mark as Paid (enabled for Lapsed too - D-28) */}
          {isSentOrOverdue && invoiceId && (
            <Button
              type="button"
              size="sm"
              onClick={() => handleStatusChange('paid')}
              disabled={isUpdatingStatus}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {isUpdatingStatus ? 'Updating...' : 'Mark as Paid'}
            </Button>
          )}

          {/* Undo Paid (revert to sent - Free and Pro only, D-28) */}
          {isPaid && invoiceId && !isLapsed && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('sent')}
              disabled={isUpdatingStatus}
              className="text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" />
              {isUpdatingStatus ? 'Updating...' : 'Undo Paid'}
            </Button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              {isDraft && isFree
                ? 'Deleting this draft will restore 1 Free invoice slot. This action cannot be undone.'
                : 'Are you sure you want to permanently delete this invoice? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
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

      {/* Upgrade to Pro Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <span className="block text-slate-700">
                Unlock custom logo branding, unlimited invoices, public shareable links, and direct email delivery.
              </span>
              <span className="block font-semibold text-slate-900">
                Plans start at only Rp29.000/month.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpgradeModalOpen(false)}
            >
              Maybe Later
            </Button>
            <Button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                setUpgradeModalOpen(false);
                router.push('/settings');
              }}
            >
              View Pro Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pro Share Link Modal */}
      {invoiceId && (
        <ShareLinkModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          invoiceId={invoiceId}
          initialPublicUrl={publicUrl}
          initialEnabled={Boolean(publicUrl)}
          onLinkStatusChange={(enabled, url) => {
            setPublicUrl(url);
          }}
        />
      )}

      {/* Pro Send Email Modal */}
      {invoiceId && (
        <SendEmailModal
          open={emailModalOpen}
          onOpenChange={setEmailModalOpen}
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber ?? null}
          clientEmail={clientEmail}
          clientName={clientName}
          senderName={senderName}
          language={language}
          isDraft={isDraft}
        />
      )}
    </TooltipProvider>
  );
}
