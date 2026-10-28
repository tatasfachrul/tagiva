/**
 * Tagiva - Invoice Feature Types
 */

import type { SupportedCurrency, DiscountType } from '@/lib/domain/calculations';
import type { InvoiceLanguage } from '@/lib/i18n/invoice-dictionary';
import type { UserPlanState } from '@/lib/domain/entitlements';
import type { InvoiceItemRow, InvoiceRow, ProfileRow } from '@/types/database';

export interface InvoiceBuilderItem {
  id: string; // local temporary key or DB id
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceBuilderFormValues {
  id?: string;
  customerId?: string | null;
  saveCustomerToDirectory: boolean;
  language: InvoiceLanguage;
  currency: SupportedCurrency;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  senderTaxId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceBuilderItem[];
  discountType: DiscountType;
  discountValue: number;
  taxLabel: string;
  taxRate: number;
  notes: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankNotes: string;
}

export interface InvoiceWithDetails extends InvoiceRow {
  items: InvoiceItemRow[];
}

export interface InvoiceDetailPageData {
  invoice: InvoiceWithDetails;
  profile: ProfileRow | null;
  planState: UserPlanState;
  isReadOnly: boolean;
  canMarkAsPaid: boolean;
  canDelete: boolean;
}

export interface ClientOption {
  id: string;
  name: string;
  company: string;
  email: string;
  address: string;
}
