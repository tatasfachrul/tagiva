import type { SupportedCurrency } from '@/lib/domain/calculations';

export interface OnboardingFormValues {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  invoicePrefix: string;
  defaultCurrency: SupportedCurrency;
  defaultLanguage: 'en' | 'id';
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankNotes: string;
}
