'use client';

/**
 * Tagiva - Invoice Builder Composition Hook
 *
 * Implements:
 * - Real-time financial calculations (MoneyCalculator, NFR-4)
 * - Live preview data generation
 * - Landing page draft restoration from sessionStorage (A-22)
 * - Line item add/remove/update
 * - PPN 11% quick chip (D-44)
 * - Discount % vs Fixed toggle (D-45)
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { calculateInvoiceTotals, type DiscountType } from '@/lib/domain/calculations';
import { getTodayWibString, addDaysWib } from '@/lib/domain/timezone';
import { useInvoiceMutations } from './use-invoice-mutations';
import type {
  InvoiceBuilderFormValues,
  InvoiceBuilderItem,
  ClientOption,
  InvoiceWithDetails,
} from '../types';
import type { InvoiceTemplateData } from '@/components/invoice-templates';
import type { ProfileRow } from '@/types/database';
import type { UserPlanState } from '@/lib/domain/entitlements';

interface UseInvoiceBuilderProps {
  initialInvoice?: InvoiceWithDetails | null;
  profile?: ProfileRow | null;
  planState: UserPlanState;
}

export function useInvoiceBuilder({
  initialInvoice,
  profile,
  planState,
}: UseInvoiceBuilderProps) {
  const { saveDraft: mutateSaveDraft, isSaving } = useInvoiceMutations();

  // Initial values setup
  const todayWib = getTodayWibString();
  const defaultDueDate = addDaysWib(todayWib, 14);

  const initialItems: InvoiceBuilderItem[] = useMemo(() => {
    if (initialInvoice?.items && initialInvoice.items.length > 0) {
      return initialInvoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
      }));
    }
    return [
      {
        id: 'item-1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        lineTotal: 0,
      },
    ];
  }, [initialInvoice]);

  const [values, setValues] = useState<InvoiceBuilderFormValues>(() => {
    const rawPI = (initialInvoice?.payment_instructions ?? profile?.bank_details ?? {}) as Record<string, string>;

    return {
      id: initialInvoice?.id,
      customerId: initialInvoice?.customer_id ?? null,
      saveCustomerToDirectory: false,
      language: initialInvoice?.language ?? profile?.default_language ?? 'en',
      currency: initialInvoice?.currency ?? profile?.default_currency ?? 'IDR',
      issueDate: initialInvoice?.issue_date ?? todayWib,
      dueDate: initialInvoice?.due_date ?? defaultDueDate,
      senderName: initialInvoice?.sender_name ?? profile?.business_name ?? '',
      senderEmail: initialInvoice?.sender_email ?? profile?.email ?? '',
      senderPhone: initialInvoice?.sender_phone ?? profile?.phone ?? '',
      senderAddress: initialInvoice?.sender_address ?? profile?.address ?? '',
      senderTaxId: initialInvoice?.sender_tax_id ?? profile?.tax_id ?? '',
      clientName: initialInvoice?.client_name ?? '',
      clientCompany: initialInvoice?.client_company ?? '',
      clientEmail: initialInvoice?.client_email ?? '',
      clientAddress: initialInvoice?.client_address ?? '',
      items: initialItems,
      discountType: (initialInvoice?.discount_type as DiscountType) ?? 'percent',
      discountValue: initialInvoice?.discount_value ?? 0,
      taxLabel: initialInvoice?.tax_label ?? 'PPN',
      taxRate: initialInvoice?.tax_rate ?? 0,
      notes: initialInvoice?.notes ?? '',
      bankName: rawPI.bankName ?? rawPI.bank_name ?? '',
      accountNumber: rawPI.accountNumber ?? rawPI.account_number ?? '',
      accountHolder: rawPI.accountHolder ?? rawPI.account_holder ?? '',
      bankNotes: rawPI.notes ?? '',
    };
  });

  // Restore draft from landing page sessionStorage if creating new invoice (A-22)
  useEffect(() => {
    if (!initialInvoice && typeof window !== 'undefined') {
      try {
        const savedDraft = sessionStorage.getItem('tagiva_landing_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setValues((prev) => ({
            ...prev,
            ...parsed,
            items: parsed.items && parsed.items.length > 0 ? parsed.items : prev.items,
          }));
          sessionStorage.removeItem('tagiva_landing_draft');
          toast.info('Restored your draft from the landing page.');
        }
      } catch {
        // Ignore session parse failure
      }
    }
  }, [initialInvoice]);

  // Real-time calculation engine
  const calculationResult = useMemo(() => {
    return calculateInvoiceTotals({
      items: values.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discountType: values.discountType,
      discountValue: values.discountValue,
      taxRate: values.taxRate,
    });
  }, [values.items, values.discountType, values.discountValue, values.taxRate]);

  // Real-time live preview data
  const previewData: InvoiceTemplateData = useMemo(() => {
    return {
      id: values.id,
      invoiceNumber: initialInvoice?.invoice_number ?? null,
      status: initialInvoice?.status ?? 'draft',
      language: values.language,
      currency: values.currency,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      senderName: values.senderName,
      senderEmail: values.senderEmail,
      senderPhone: values.senderPhone,
      senderAddress: values.senderAddress,
      senderTaxId: values.senderTaxId,
      logoUrl: initialInvoice?.logo_url ?? (planState === 'pro' ? profile?.logo_url ?? null : null),
      clientName: values.clientName,
      clientCompany: values.clientCompany,
      clientEmail: values.clientEmail,
      clientAddress: values.clientAddress,
      items: calculationResult.items.map((item, idx) => ({
        id: values.items[idx]?.id ?? `item-${idx}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: calculationResult.subtotal,
      discountType: values.discountType,
      discountValue: values.discountValue,
      discountAmount: calculationResult.discountAmount,
      taxLabel: values.taxLabel,
      taxRate: values.taxRate,
      taxAmount: calculationResult.taxAmount,
      totalAmount: calculationResult.totalAmount,
      notes: values.notes,
      paymentInstructions: {
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        accountHolder: values.accountHolder,
        notes: values.bankNotes,
      },
    };
  }, [values, initialInvoice, profile, planState, calculationResult]);

  // Field change helper
  const handleChange = useCallback(
    <K extends keyof InvoiceBuilderFormValues>(key: K, value: InvoiceBuilderFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Line item manipulation
  const addItem = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          lineTotal: 0,
        },
      ],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setValues((prev) => {
      if (prev.items.length <= 1) {
        toast.error('An invoice must have at least one line item.');
        return prev;
      }
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      };
    });
  }, []);

  const updateItem = useCallback(
    (id: string, field: keyof InvoiceBuilderItem, val: string | number) => {
      setValues((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: val };
          if (field === 'quantity' || field === 'unitPrice') {
            const qty = Number(field === 'quantity' ? val : updated.quantity) || 0;
            const price = Number(field === 'unitPrice' ? val : updated.unitPrice) || 0;
            updated.lineTotal = Math.round(qty * price * 100) / 100;
          }
          return updated;
        }),
      }));
    },
    [],
  );

  // Quick Client Picker (FR-5.11)
  const selectClient = useCallback((client: ClientOption) => {
    setValues((prev) => ({
      ...prev,
      customerId: client.id,
      clientName: client.name,
      clientCompany: client.company || '',
      clientEmail: client.email || '',
      clientAddress: client.address || '',
    }));
    toast.success(`Selected ${client.name}`);
  }, []);

  // PPN 11% Quick Chip (D-44)
  const togglePpn11 = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      taxLabel: 'PPN',
      taxRate: prev.taxRate === 11 ? 0 : 11,
    }));
  }, []);

  // Save Draft Action (delegated to useInvoiceMutations)
  const saveDraft = useCallback(async () => {
    await mutateSaveDraft({
      id: values.id,
      customerId: values.customerId,
      saveCustomerToDirectory: values.saveCustomerToDirectory,
      language: values.language,
      currency: values.currency,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      sender: {
        name: values.senderName,
        email: values.senderEmail,
        phone: values.senderPhone,
        address: values.senderAddress,
        taxId: values.senderTaxId,
        paymentInstructions: {
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          accountHolder: values.accountHolder,
          notes: values.bankNotes,
        },
      },
      client: {
        name: values.clientName,
        company: values.clientCompany,
        email: values.clientEmail,
        address: values.clientAddress,
      },
      items: values.items.map((i) => ({
        description: i.description || 'Item description',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discountType: values.discountType,
      discountValue: values.discountValue,
      taxLabel: values.taxLabel,
      taxRate: values.taxRate,
      notes: values.notes,
    });
  }, [values, mutateSaveDraft]);

  return {
    values,
    previewData,
    calculationResult,
    isSaving,
    handleChange,
    addItem,
    removeItem,
    updateItem,
    selectClient,
    togglePpn11,
    saveDraft,
  };
}
