/**
 * Tagiva - Invoice Document Bilingual Dictionary & Formatters
 *
 * Implements exact English and Bahasa Indonesia labels specified in:
 * - DESIGN_SYSTEM.md Section 7.4 (Bilingual Template Label Dictionary)
 * - PRD.md D-17, D-42, D-43, D-40
 */

export type InvoiceLanguage = 'en' | 'id';

export interface InvoiceDictionaryLabels {
  documentTitle: string;
  draftPlaceholder: string;
  fromLabel: string;
  billedToLabel: string;
  invoiceNoLabel: string;
  issueDateLabel: string;
  dueDateLabel: string;
  colDescription: string;
  colQty: string;
  colUnitPrice: string;
  colAmount: string;
  subtotalLabel: string;
  discountLabel: string;
  totalLabel: string;
  paymentInstructionsLabel: string;
  bankNameLabel: string;
  accountNoLabel: string;
  accountHolderLabel: string;
  notesLabel: string;
  statusPaidStamp: string;
  platformFooter: string;
  statusBadges: {
    unpaid: string;
    paid: string;
    overdue: string;
  };
}

export const INVOICE_DICTIONARY: Record<InvoiceLanguage, InvoiceDictionaryLabels> = {
  en: {
    documentTitle: 'INVOICE',
    draftPlaceholder: '[DRAFT]',
    fromLabel: 'From',
    billedToLabel: 'Billed To',
    invoiceNoLabel: 'Invoice No.',
    issueDateLabel: 'Issue Date',
    dueDateLabel: 'Due Date',
    colDescription: 'Description',
    colQty: 'Qty',
    colUnitPrice: 'Unit Price',
    colAmount: 'Amount',
    subtotalLabel: 'Subtotal',
    discountLabel: 'Discount',
    totalLabel: 'Total Due',
    paymentInstructionsLabel: 'Payment Instructions',
    bankNameLabel: 'Bank',
    accountNoLabel: 'Account No.',
    accountHolderLabel: 'Account Holder',
    notesLabel: 'Notes / Terms',
    statusPaidStamp: 'PAID',
    platformFooter: 'Made with Tagiva • tagiva.com',
    statusBadges: {
      unpaid: 'UNPAID',
      paid: 'PAID',
      overdue: 'OVERDUE',
    },
  },
  id: {
    documentTitle: 'FAKTUR',
    draftPlaceholder: '[DRAFT]', // D-42: always literal [DRAFT] in ID too
    fromLabel: 'Dari',
    billedToLabel: 'Ditagihkan Kepada',
    invoiceNoLabel: 'No. Faktur',
    issueDateLabel: 'Tanggal Terbit',
    dueDateLabel: 'Jatuh Tempo',
    colDescription: 'Deskripsi',
    colQty: 'Jml',
    colUnitPrice: 'Harga Satuan',
    colAmount: 'Jumlah',
    subtotalLabel: 'Subtotal',
    discountLabel: 'Diskon',
    totalLabel: 'Total Tagihan',
    paymentInstructionsLabel: 'Instruksi Pembayaran',
    bankNameLabel: 'Bank',
    accountNoLabel: 'No. Rekening',
    accountHolderLabel: 'Atas Nama',
    notesLabel: 'Catatan / Syarat',
    statusPaidStamp: 'LUNAS',
    platformFooter: 'Dibuat dengan Tagiva • tagiva.com',
    statusBadges: {
      unpaid: 'BELUM DIBAYAR',
      paid: 'LUNAS',
      overdue: 'JATUH TEMPO',
    },
  },
};

/**
 * Returns dictionary labels for the chosen invoice language (defaults to 'en').
 */
export function getInvoiceDictionary(language: InvoiceLanguage = 'en'): InvoiceDictionaryLabels {
  return INVOICE_DICTIONARY[language] ?? INVOICE_DICTIONARY.en;
}

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] as const;

/**
 * Formats a date string (YYYY-MM-DD or ISO) into "DD MMM YYYY" per DS-A04.
 * English example: "27 Oct 2026"
 * Indonesian example: "27 Okt 2026"
 */
export function formatInvoiceDate(dateString: string, language: InvoiceLanguage = 'en'): string {
  if (!dateString) return '';
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateString;

  const year = match[1];
  const monthIdx = parseInt(match[2] ?? '1', 10) - 1;
  const day = parseInt(match[3] ?? '1', 10);

  const months = language === 'id' ? ID_MONTHS : EN_MONTHS;
  const monthName = months[monthIdx] ?? (language === 'id' ? 'Jan' : 'Jan');

  return `${day} ${monthName} ${year}`;
}
