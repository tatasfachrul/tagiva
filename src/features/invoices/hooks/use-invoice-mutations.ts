'use client';

/**
 * Tagiva - Invoice Mutations Hook
 *
 * Provides a clean, service-like client-side interface for all invoice mutations.
 * Encapsulates:
 * - Loading states (isSaving, isIssuing, isUpdatingStatus, isDeleting, etc.)
 * - Calling Server Actions (which delegate to InvoiceService on the server)
 * - User feedback (Sonner toasts)
 * - Router navigation & revalidation
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  saveInvoiceDraftAction,
  issueInvoiceAction,
  updateInvoiceStatusAction,
  deleteInvoiceAction,
  duplicateInvoiceAction,
  createOrTogglePublicLinkAction,
} from '../actions';
import type {
  SaveInvoiceInput,
  IssueInvoiceInput,
  UpdateInvoiceStatusInput,
  DeleteInvoiceInput,
  DuplicateInvoiceInput,
  CreateOrTogglePublicLinkInput,
} from '@/lib/validations/invoice';

export function useInvoiceMutations() {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isTogglingLink, setIsTogglingLink] = useState(false);

  /**
   * Saves or updates an invoice draft.
   */
  const saveDraft = useCallback(
    async (input: SaveInvoiceInput) => {
      setIsSaving(true);
      try {
        const res = await saveInvoiceDraftAction(input);

        if (!res.ok) {
          toast.error(res.error.message);
          return { ok: false, error: res.error } as const;
        }

        toast.success('Invoice draft saved successfully!');

        if (!input.id) {
          router.push(`/invoices/${res.data.invoiceId}`);
        } else {
          router.refresh();
        }

        return { ok: true, data: res.data } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save draft.';
        toast.error(message);
        return { ok: false, error: { code: 'INTERNAL_ERROR', message } } as const;
      } finally {
        setIsSaving(false);
      }
    },
    [router],
  );

  /**
   * Issues an invoice, assigning permanent sequence number.
   */
  const issueInvoice = useCallback(
    async (input: IssueInvoiceInput) => {
      setIsIssuing(true);
      try {
        const res = await issueInvoiceAction(input);

        if (!res.ok) {
          toast.error(res.error.message);
          return { ok: false, error: res.error } as const;
        }

        toast.success(`Invoice issued successfully: ${res.data.invoiceNumber}`);
        router.refresh();
        return { ok: true, data: res.data } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to issue invoice.';
        toast.error(message);
        return { ok: false, error: { code: 'INTERNAL_ERROR', message } } as const;
      } finally {
        setIsIssuing(false);
      }
    },
    [router],
  );

  /**
   * Updates an issued invoice status (e.g. marking as paid or sent).
   */
  const updateStatus = useCallback(
    async (input: UpdateInvoiceStatusInput) => {
      setIsUpdatingStatus(true);
      try {
        const res = await updateInvoiceStatusAction(input);

        if (!res.ok) {
          toast.error(res.error.message);
          return { ok: false, error: res.error } as const;
        }

        toast.success(
          input.targetStatus === 'paid' ? 'Marked as Paid!' : 'Status reverted to Sent.',
        );
        router.refresh();
        return { ok: true, data: res.data } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update invoice status.';
        toast.error(message);
        return { ok: false, error: { code: 'INTERNAL_ERROR', message } } as const;
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [router],
  );

  /**
   * Deletes an invoice (following Free vs Pro plan rules).
   */
  const deleteInvoice = useCallback(
    async (input: DeleteInvoiceInput) => {
      setIsDeleting(true);
      try {
        const res = await deleteInvoiceAction(input);

        if (!res.ok) {
          toast.error(res.error.message);
          return { ok: false, error: res.error } as const;
        }

        toast.success('Invoice deleted.');
        router.push('/dashboard');
        return { ok: true, data: res.data } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete invoice.';
        toast.error(message);
        return { ok: false, error: { code: 'INTERNAL_ERROR', message } } as const;
      } finally {
        setIsDeleting(false);
      }
    },
    [router],
  );

  /**
   * Duplicates an existing invoice into a new draft.
   */
  const duplicateInvoice = useCallback(
    async (input: DuplicateInvoiceInput) => {
      setIsDuplicating(true);
      try {
        const res = await duplicateInvoiceAction(input);

        if (!res.ok) {
          toast.error(res.error.message);
          return { ok: false, error: res.error } as const;
        }

        toast.success('Invoice duplicated!');
        router.push(`/invoices/${res.data.newInvoiceId}`);
        return { ok: true, data: res.data } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to duplicate invoice.';
        toast.error(message);
        return { ok: false, error: { code: 'INTERNAL_ERROR', message } } as const;
      } finally {
        setIsDuplicating(false);
      }
    },
    [router],
  );

  /**
   * Toggles public link sharing for an invoice (Pro feature).
   */
  const togglePublicLink = useCallback(
    async (input: CreateOrTogglePublicLinkInput) => {
      setIsTogglingLink(true);
      try {
        const res = await createOrTogglePublicLinkAction(input);

        if (!res.ok) {
          toast.error(res.error.message);
          return { ok: false, error: res.error } as const;
        }

        toast.success(input.enabled ? 'Public link enabled!' : 'Public link disabled.');
        router.refresh();
        return { ok: true, data: res.data } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to configure public link.';
        toast.error(message);
        return { ok: false, error: { code: 'INTERNAL_ERROR', message } } as const;
      } finally {
        setIsTogglingLink(false);
      }
    },
    [router],
  );

  return {
    // Loading states
    isSaving,
    isIssuing,
    isUpdatingStatus,
    isDeleting,
    isDuplicating,
    isTogglingLink,
    isLoading: isSaving || isIssuing || isUpdatingStatus || isDeleting || isDuplicating || isTogglingLink,

    // Mutation methods
    saveDraft,
    issueInvoice,
    updateStatus,
    deleteInvoice,
    duplicateInvoice,
    togglePublicLink,
  };
}
