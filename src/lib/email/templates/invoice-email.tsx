/**
 * Tagiva - Bilingual Transactional Invoice Email Template
 *
 * Implements:
 * - FR-9.3: Invoice summary (number, total, due date), link to public invoice, and PDF attachment indicator
 * - FR-9.4: Bilingual EN/ID fixed labels based on invoice.language
 * - High client compatibility HTML with inline CSS
 */

import { formatCurrency, type SupportedCurrency } from '@/lib/domain/calculations';
import { formatDateWib } from '@/lib/domain/timezone';

export interface InvoiceEmailProps {
  senderName: string;
  senderEmail?: string;
  clientName: string;
  invoiceNumber: string;
  dueDate: string;
  issueDate: string;
  currency: SupportedCurrency | string;
  totalAmount: number;
  message?: string;
  publicUrl?: string;
  language?: 'en' | 'id';
}

export function renderInvoiceEmailHtml({
  senderName,
  clientName,
  invoiceNumber,
  dueDate,
  issueDate,
  currency,
  totalAmount,
  message,
  publicUrl,
  language = 'en',
}: InvoiceEmailProps): string {
  const isId = language === 'id';

  const formattedTotal = formatCurrency(
    totalAmount,
    (currency as SupportedCurrency) || 'IDR',
  );
  const formattedDueDate = formatDateWib(dueDate, language);
  const formattedIssueDate = formatDateWib(issueDate, language);

  const t = {
    heading: isId ? `Faktur dari ${senderName}` : `Invoice from ${senderName}`,
    greeting: isId ? `Halo ${clientName},` : `Hi ${clientName},`,
    defaultNote: isId
      ? `Berikut terlampir faktur ${invoiceNumber} untuk pembayaran Anda.`
      : `Please find attached your invoice ${invoiceNumber} for your review and payment.`,
    summaryTitle: isId ? 'Ringkasan Faktur' : 'Invoice Summary',
    lblNumber: isId ? 'Nomor Faktur' : 'Invoice Number',
    lblIssueDate: isId ? 'Tanggal Terbit' : 'Issue Date',
    lblDueDate: isId ? 'Jatuh Tempo' : 'Due Date',
    lblTotal: isId ? 'Total Tagihan' : 'Total Due',
    btnCta: isId ? 'Lihat Faktur Online' : 'View Invoice Online',
    attachmentNotice: isId
      ? '📎 Dokumen PDF faktur resmi telah dilampirkan langsung pada email ini.'
      : '📎 The official invoice PDF is attached directly to this email.',
    footerText: isId
      ? 'Dibuat dan dikirim menggunakan Tagiva • Pembuat faktur profesional'
      : 'Created and sent with Tagiva • Professional invoice maker',
  };

  const userMessageHtml = message && message.trim().length > 0
    ? `<div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-left: 3px solid #0f172a; border-radius: 4px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(
        message.trim(),
      )}</div>`
    : `<p style="margin: 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">${t.defaultNote}</p>`;

  const ctaButtonHtml = publicUrl
    ? `<div style="text-align: center; margin: 32px 0 24px;">
        <a href="${publicUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; letter-spacing: -0.01em;">
          ${t.btnCta} &rarr;
        </a>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(t.heading)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">
                      ${escapeHtml(senderName)}
                    </h1>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px;">
                      ${isId ? 'FAKTUR' : 'INVOICE'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #0f172a; font-weight: 500;">
                ${escapeHtml(t.greeting)}
              </p>

              ${userMessageHtml}

              <!-- Invoice Summary Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b;">
                      ${t.summaryTitle}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">${t.lblNumber}</td>
                        <td align="right" style="padding: 4px 0; font-weight: 600; color: #0f172a; font-family: monospace;">${escapeHtml(invoiceNumber)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">${t.lblIssueDate}</td>
                        <td align="right" style="padding: 4px 0; color: #334155;">${formattedIssueDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">${t.lblDueDate}</td>
                        <td align="right" style="padding: 4px 0; font-weight: 600; color: #e11d48;">${formattedDueDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0 0; color: #0f172a; font-weight: 700; border-top: 1px dashed #cbd5e1; font-size: 14px;">${t.lblTotal}</td>
                        <td align="right" style="padding: 8px 0 0; color: #0f172a; font-weight: 700; border-top: 1px dashed #cbd5e1; font-size: 16px;">${formattedTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${ctaButtonHtml}

              <p style="margin: 20px 0 0; font-size: 12px; color: #64748b; text-align: center;">
                ${t.attachmentNotice}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                ${t.footerText} • <a href="https://tagiva.com" target="_blank" rel="noopener noreferrer" style="color: #64748b; text-decoration: none;">tagiva.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
