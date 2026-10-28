import React from 'react';
import path from 'path';
import fs from 'fs';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
  type DocumentProps,
} from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/domain/calculations';
import {
  formatInvoiceDate,
  getInvoiceDictionary,
} from '@/lib/i18n/invoice-dictionary';
import { validateSupabaseLogoUrl } from '@/lib/security/ssrf';
import type { InvoiceRenderProps } from '../types';

// ==========================================
// 1. Font Registration (Inter only - D-41)
// ==========================================
let fontsRegistered = false;

function ensureFontsRegistered() {
  if (fontsRegistered) return;

  try {
    if (typeof window === 'undefined') {
      const regularPath = path.resolve(process.cwd(), 'public/fonts/inter/Inter-Regular.ttf');
      const mediumPath = path.resolve(process.cwd(), 'public/fonts/inter/Inter-Medium.ttf');
      const semiBoldPath = path.resolve(process.cwd(), 'public/fonts/inter/Inter-SemiBold.ttf');
      const boldPath = path.resolve(process.cwd(), 'public/fonts/inter/Inter-Bold.ttf');

      if (fs.existsSync(regularPath)) {
        Font.register({
          family: 'Inter',
          fonts: [
            { src: regularPath, fontWeight: 400 },
            { src: mediumPath, fontWeight: 500 },
            { src: semiBoldPath, fontWeight: 600 },
            { src: boldPath, fontWeight: 700 },
          ],
        });
        fontsRegistered = true;
      }
    } else {
      Font.register({
        family: 'Inter',
        fonts: [
          { src: '/fonts/inter/Inter-Regular.ttf', fontWeight: 400 },
          { src: '/fonts/inter/Inter-Medium.ttf', fontWeight: 500 },
          { src: '/fonts/inter/Inter-SemiBold.ttf', fontWeight: 600 },
          { src: '/fonts/inter/Inter-Bold.ttf', fontWeight: 700 },
        ],
      });
      fontsRegistered = true;
    }
  } catch (error) {
    console.error('Failed to register Inter fonts for PDF renderer:', error);
  }
}

// Register upon module load
ensureFontsRegistered();

// ==========================================
// 2. Stylesheet (Points pt, A4 standard)
// ==========================================
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#0F172A', // slate-900
    backgroundColor: '#FFFFFF',
    padding: 36, // ~13mm margin
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    flexGrow: 1,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  senderCol: {
    maxWidth: '55%',
  },
  logo: {
    maxHeight: 48,
    maxWidth: 150,
    objectFit: 'contain',
    marginBottom: 8,
  },
  senderTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 3,
  },
  senderText: {
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.35,
  },
  titleCol: {
    alignItems: 'flex-end',
    maxWidth: '45%',
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0F172A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  draftBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 3,
  },
  draftText: {
    fontSize: 8,
    fontWeight: 600,
    color: '#334155',
    letterSpacing: 1,
  },
  invoiceNumber: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: 600,
    color: '#1E293B',
  },
  statusBadge: {
    marginTop: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeDraft: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    color: '#475569',
  },
  statusBadgeUnpaid: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    color: '#1D4ED8',
  },
  statusBadgePaid: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    color: '#047857',
  },
  statusBadgeOverdue: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    color: '#BE123C',
  },
  statusBadgeText: {
    fontSize: 7.5,
    fontWeight: 600,
    textTransform: 'uppercase',
  },

  // Recipient & Metadata Grid
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 20,
  },
  billedToCol: {
    width: '58%',
  },
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#0F172A',
    marginBottom: 2,
  },
  clientCompany: {
    fontSize: 8.5,
    fontWeight: 500,
    color: '#334155',
    marginBottom: 2,
  },
  clientText: {
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.35,
  },
  datesCol: {
    width: '38%',
    alignItems: 'flex-end',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  dateLabel: {
    fontSize: 8.5,
    color: '#64748B',
    fontWeight: 500,
    marginRight: 6,
  },
  dateValue: {
    fontSize: 8.5,
    fontWeight: 600,
    color: '#0F172A',
  },

  // Table
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  thIndex: {
    width: '6%',
    textAlign: 'center',
    fontSize: 7.5,
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
  },
  thDesc: {
    width: '48%',
    fontSize: 7.5,
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
  },
  thQty: {
    width: '12%',
    textAlign: 'right',
    fontSize: 7.5,
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
  },
  thPrice: {
    width: '17%',
    textAlign: 'right',
    fontSize: 7.5,
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
  },
  thAmount: {
    width: '17%',
    textAlign: 'right',
    fontSize: 7.5,
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tdIndex: {
    width: '6%',
    textAlign: 'center',
    fontSize: 8.5,
    color: '#94A3B8',
  },
  tdDesc: {
    width: '48%',
    fontSize: 8.5,
    color: '#0F172A',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  tdQty: {
    width: '12%',
    textAlign: 'right',
    fontSize: 8.5,
    color: '#334155',
  },
  tdPrice: {
    width: '17%',
    textAlign: 'right',
    fontSize: 8.5,
    color: '#334155',
  },
  tdAmount: {
    width: '17%',
    textAlign: 'right',
    fontSize: 8.5,
    fontWeight: 600,
    color: '#0F172A',
  },

  // Totals
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
  },
  totalLabel: {
    fontSize: 8.5,
    color: '#475569',
    fontWeight: 500,
  },
  totalValue: {
    fontSize: 8.5,
    color: '#0F172A',
    fontWeight: 600,
  },
  discountLabel: {
    fontSize: 8.5,
    color: '#047857',
    fontWeight: 500,
  },
  discountValue: {
    fontSize: 8.5,
    color: '#047857',
    fontWeight: 600,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#0F172A',
    paddingTop: 5,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0F172A',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0F172A',
  },

  // Bottom info (Payment + Notes)
  bottomInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  bottomCol: {
    width: '48%',
  },
  paymentCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 4,
    padding: 8,
  },
  paymentLine: {
    fontSize: 8,
    color: '#334155',
    marginBottom: 2,
  },
  paymentLineLabel: {
    color: '#64748B',
    fontWeight: 500,
  },
  paymentLineBold: {
    fontWeight: 600,
    color: '#0F172A',
  },
  notesText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.35,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    textAlign: 'center',
    fontSize: 7.5,
    color: '#64748B',
  },
});

export function ModernMinimalistPdfDocument({
  invoice,
  showFooter = false,
}: InvoiceRenderProps) {
  ensureFontsRegistered();

  const dict = getInvoiceDictionary(invoice.language);
  const isDraft = invoice.status === 'draft' || !invoice.invoiceNumber;

  // SSRF Protection (D-49): only allow verified Supabase Storage URLs
  const validatedLogoUrl = validateSupabaseLogoUrl(invoice.logoUrl);

  const hasDiscount = (invoice.discountAmount ?? 0) > 0;
  const hasTax = (invoice.taxRate ?? 0) > 0 || (invoice.taxAmount ?? 0) > 0;
  const hasPaymentDetails = Boolean(
    invoice.paymentInstructions?.bankName ||
      invoice.paymentInstructions?.accountNumber ||
      invoice.paymentInstructions?.accountHolder,
  );

  const statusConfig = {
    draft: {
      label: 'DRAFT',
      style: styles.statusBadgeDraft,
    },
    sent: {
      label: dict.statusBadges.unpaid,
      style: styles.statusBadgeUnpaid,
    },
    paid: {
      label: dict.statusBadges.paid,
      style: styles.statusBadgePaid,
    },
    overdue: {
      label: dict.statusBadges.overdue,
      style: styles.statusBadgeOverdue,
    },
  }[invoice.status] ?? {
    label: 'DRAFT',
    style: styles.statusBadgeDraft,
  };

  return (
    <Document title={`${invoice.invoiceNumber ?? 'DRAFT'}-Invoice`} author="Tagiva">
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            {/* Sender Info */}
            <View style={styles.senderCol}>
              {validatedLogoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={validatedLogoUrl} style={styles.logo} />
              ) : null}
              <Text style={styles.senderTitle}>
                {invoice.senderName || 'Your Business Name'}
              </Text>
              {invoice.senderAddress ? (
                <Text style={styles.senderText}>{invoice.senderAddress}</Text>
              ) : null}
              {invoice.senderEmail ? (
                <Text style={styles.senderText}>{invoice.senderEmail}</Text>
              ) : null}
              {invoice.senderPhone ? (
                <Text style={styles.senderText}>{invoice.senderPhone}</Text>
              ) : null}
              {invoice.senderTaxId ? (
                <Text style={styles.senderText}>
                  NPWP / Tax ID: {invoice.senderTaxId}
                </Text>
              ) : null}
            </View>

            {/* Document Title & Number */}
            <View style={styles.titleCol}>
              <Text style={styles.documentTitle}>{dict.documentTitle}</Text>

              {isDraft ? (
                <View style={styles.draftBadge}>
                  <Text style={styles.draftText}>{dict.draftPlaceholder}</Text>
                </View>
              ) : (
                <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              )}

              {/* Status Badge */}
              <View style={[styles.statusBadge, statusConfig.style]}>
                <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
              </View>
            </View>
          </View>

          {/* Recipient & Metadata Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.billedToCol}>
              <Text style={styles.sectionLabel}>{dict.billedToLabel}</Text>
              <Text style={styles.clientName}>
                {invoice.clientName || 'Client Name'}
              </Text>
              {invoice.clientCompany ? (
                <Text style={styles.clientCompany}>{invoice.clientCompany}</Text>
              ) : null}
              {invoice.clientAddress ? (
                <Text style={styles.clientText}>{invoice.clientAddress}</Text>
              ) : null}
              {invoice.clientEmail ? (
                <Text style={styles.clientText}>{invoice.clientEmail}</Text>
              ) : null}
            </View>

            <View style={styles.datesCol}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>{dict.issueDateLabel}:</Text>
                <Text style={styles.dateValue}>
                  {formatInvoiceDate(invoice.issueDate, invoice.language) || '—'}
                </Text>
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>{dict.dueDateLabel}:</Text>
                <Text style={styles.dateValue}>
                  {formatInvoiceDate(invoice.dueDate, invoice.language) || '—'}
                </Text>
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Currency:</Text>
                <Text style={styles.dateValue}>{invoice.currency}</Text>
              </View>
            </View>
          </View>

          {/* Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.thIndex}>#</Text>
              <Text style={styles.thDesc}>{dict.colDescription}</Text>
              <Text style={styles.thQty}>{dict.colQty}</Text>
              <Text style={styles.thPrice}>{dict.colUnitPrice}</Text>
              <Text style={styles.thAmount}>{dict.colAmount}</Text>
            </View>

            {invoice.items.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={[styles.tdDesc, { width: '100%', textAlign: 'center', color: '#94A3B8' }]}>
                  No line items.
                </Text>
              </View>
            ) : (
              invoice.items.map((item, idx) => (
                <View key={item.id ?? idx} style={styles.tableRow}>
                  <Text style={styles.tdIndex}>{idx + 1}</Text>
                  <Text style={styles.tdDesc}>
                    {item.description || 'Item description'}
                  </Text>
                  <Text style={styles.tdQty}>{item.quantity}</Text>
                  <Text style={styles.tdPrice}>
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </Text>
                  <Text style={styles.tdAmount}>
                    {formatCurrency(item.lineTotal, invoice.currency)}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{dict.subtotalLabel}</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </Text>
              </View>

              {hasDiscount && (
                <View style={styles.totalRow}>
                  <Text style={styles.discountLabel}>
                    {dict.discountLabel}
                    {invoice.discountType === 'percent' && invoice.discountValue
                      ? ` (${invoice.discountValue}%)`
                      : ''}
                  </Text>
                  <Text style={styles.discountValue}>
                    -{formatCurrency(invoice.discountAmount ?? 0, invoice.currency)}
                  </Text>
                </View>
              )}

              {hasTax && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    {invoice.taxLabel || 'PPN'}
                    {invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}
                  </Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(invoice.taxAmount ?? 0, invoice.currency)}
                  </Text>
                </View>
              )}

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>{dict.totalLabel}</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Info: Payment Details & Notes */}
          <View style={styles.bottomInfoGrid}>
            <View style={styles.bottomCol}>
              {hasPaymentDetails && (
                <View>
                  <Text style={styles.sectionLabel}>
                    {dict.paymentInstructionsLabel}
                  </Text>
                  <View style={styles.paymentCard}>
                    {invoice.paymentInstructions?.bankName && (
                      <Text style={styles.paymentLine}>
                        <Text style={styles.paymentLineLabel}>{dict.bankNameLabel}: </Text>
                        <Text style={styles.paymentLineBold}>{invoice.paymentInstructions.bankName}</Text>
                      </Text>
                    )}
                    {invoice.paymentInstructions?.accountNumber && (
                      <Text style={styles.paymentLine}>
                        <Text style={styles.paymentLineLabel}>{dict.accountNoLabel}: </Text>
                        <Text style={styles.paymentLineBold}>{invoice.paymentInstructions.accountNumber}</Text>
                      </Text>
                    )}
                    {invoice.paymentInstructions?.accountHolder && (
                      <Text style={styles.paymentLine}>
                        <Text style={styles.paymentLineLabel}>{dict.accountHolderLabel}: </Text>
                        <Text style={styles.paymentLineBold}>{invoice.paymentInstructions.accountHolder}</Text>
                      </Text>
                    )}
                    {invoice.paymentInstructions?.notes && (
                      <Text style={[styles.paymentLine, { color: '#64748B', marginTop: 2 }]}>
                        {invoice.paymentInstructions.notes}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.bottomCol}>
              {invoice.notes ? (
                <View>
                  <Text style={styles.sectionLabel}>{dict.notesLabel}</Text>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Platform Footer (Free & Lapsed only - D-40, FR-7.3) */}
        {showFooter && (
          <Text style={styles.footer}>{dict.platformFooter}</Text>
        )}
      </Page>
    </Document>
  );
}

/**
 * Renders an invoice document to a Node.js Buffer using @react-pdf/renderer.
 */
export async function renderInvoicePdfToBuffer(
  invoice: InvoiceRenderProps['invoice'],
  showFooter = false,
): Promise<Buffer> {
  const element = React.createElement(ModernMinimalistPdfDocument, {
    invoice,
    showFooter,
  }) as unknown as React.ReactElement<DocumentProps>;

  return renderToBuffer(element);
}
