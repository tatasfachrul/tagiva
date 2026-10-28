/**
 * Tagiva - Bilingual Subscription Expiry & Renewal Reminder Email Template
 *
 * Implements:
 * - D-26 / A-20: 30d, 14d, 3d, 0d manual expiry reminders
 * - D-53: auto_renew_3d upcoming automatic renewal notice
 * - Bilingual EN/ID support with inline styles for email client compatibility
 */

import { formatDateWib } from '@/lib/domain/timezone';
import { CANONICAL_PRICING_IDR, type PlanDurationMonths } from '@/lib/billing/adapter';

export type ReminderType = '30d' | '14d' | '3d' | '0d' | 'auto_renew_3d';

export interface SubscriptionReminderEmailProps {
  userName: string;
  reminderType: ReminderType;
  periodEndDate: string; // ISO or YYYY-MM-DD
  planDurationMonths: number;
  language?: 'en' | 'id';
}

export function getReminderEmailSubject(
  reminderType: ReminderType,
  language: 'en' | 'id' = 'en',
): string {
  const isId = language === 'id';

  switch (reminderType) {
    case '30d':
      return isId
        ? 'Pengingat: Langganan Tagiva Pro Anda berakhir dalam 30 hari'
        : 'Reminder: Your Tagiva Pro subscription ends in 30 days';
    case '14d':
      return isId
        ? 'Pengingat: Langganan Tagiva Pro Anda berakhir dalam 14 hari'
        : 'Reminder: Your Tagiva Pro subscription ends in 14 days';
    case '3d':
      return isId
        ? 'Perhatian: Langganan Tagiva Pro Anda berakhir dalam 3 hari'
        : 'Action Needed: Your Tagiva Pro subscription ends in 3 days';
    case '0d':
      return isId
        ? 'Pemberitahuan: Hari terakhir langganan Tagiva Pro Anda'
        : 'Urgent: Today is the last day of your Tagiva Pro subscription';
    case 'auto_renew_3d':
      return isId
        ? 'Pemberitahuan: Perpanjangan otomatis Tagiva Pro dalam 3 hari'
        : 'Notice: Your Tagiva Pro auto-renewal in 3 days';
  }
}

export function renderSubscriptionReminderEmailHtml({
  userName,
  reminderType,
  periodEndDate,
  planDurationMonths,
  language = 'en',
}: SubscriptionReminderEmailProps): string {
  const isId = language === 'id';
  const formattedDate = formatDateWib(periodEndDate, language);

  const durationKey = (
    [1, 3, 6, 12].includes(planDurationMonths) ? planDurationMonths : 1
  ) as PlanDurationMonths;
  const renewalPrice = CANONICAL_PRICING_IDR[durationKey];
  const formattedPrice = `Rp${renewalPrice.toLocaleString('id-ID')}`;

  const isAutoRenew = reminderType === 'auto_renew_3d';

  let titleText = '';
  let bodyText = '';
  let badgeColor = '#4f46e5'; // indigo
  let badgeText = 'TAGIVA PRO';

  if (isAutoRenew) {
    titleText = isId ? 'Pemberitahuan Perpanjangan Otomatis' : 'Upcoming Auto-Renewal Notice';
    bodyText = isId
      ? `Langganan Tagiva Pro Anda (${planDurationMonths} bulan) akan diperpanjang secara otomatis pada <strong>${formattedDate}</strong> sebesar <strong>${formattedPrice}</strong>. Jika Anda ingin mengubah metode pembayaran atau mematikan perpanjangan otomatis, silakan kunjungi pengaturan akun Anda sebelum tanggal tersebut.`
      : `Your Tagiva Pro subscription (${planDurationMonths} month${planDurationMonths > 1 ? 's' : ''}) will automatically renew on <strong>${formattedDate}</strong> for <strong>${formattedPrice}</strong>. If you wish to update your payment method or cancel auto-renewal, please visit your account billing settings before this date.`;
  } else {
    badgeColor = reminderType === '0d' ? '#e11d48' : reminderType === '3d' ? '#d97706' : '#4f46e5';
    badgeText = reminderType === '0d' ? (isId ? 'HARI TERAKHIR' : 'FINAL DAY') : 'TAGIVA PRO';

    titleText = isId ? 'Langganan Pro Anda Segera Berakhir' : 'Your Pro Subscription is Expiring';

    if (reminderType === '0d') {
      bodyText = isId
        ? `Hari ini adalah hari terakhir masa aktif langganan Tagiva Pro Anda. Jika tidak diperpanjang sebelum akhir hari, akun Anda akan beralih ke status <strong>Lapsed</strong> (pembuatan faktur baru akan dibatasi dan faktur lama menjadi read-only).`
        : `Today is the final day of your Tagiva Pro subscription. If not renewed before the end of the day, your account will transition to <strong>Lapsed</strong> status (new invoice creation will be capped and existing invoices will become read-only).`;
    } else if (reminderType === '3d') {
      bodyText = isId
        ? `Masa aktif Tagiva Pro Anda akan berakhir dalam <strong>3 hari</strong> pada <strong>${formattedDate}</strong>. Perpanjang sekarang agar Anda tetap dapat menikmati pembuatan faktur tanpa batas dan tanpa tanda air.`
        : `Your Tagiva Pro subscription will expire in <strong>3 days</strong> on <strong>${formattedDate}</strong>. Renew today to keep unlimited invoicing and watermark-free PDFs uninterrupted.`;
    } else {
      const days = reminderType === '30d' ? '30' : '14';
      bodyText = isId
        ? `Langganan Tagiva Pro Anda akan berakhir dalam <strong>${days} hari</strong> pada <strong>${formattedDate}</strong>. Anda dapat memperpanjang paket Anda kapan saja untuk menambah masa aktif tanpa kehilangan hari yang tersisa.`
        : `Your Tagiva Pro subscription will expire in <strong>${days} days</strong> on <strong>${formattedDate}</strong>. You can renew at any time to add time onto your current plan without losing remaining days.`;
    }
  }

  const ctaUrl = 'https://tagiva.com/settings/billing';
  const ctaText = isAutoRenew
    ? (isId ? 'Kelola Pengaturan Pembayaran' : 'Manage Billing Settings')
    : (isId ? 'Perpanjang Tagiva Pro' : 'Renew Tagiva Pro');

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(titleText)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em;">Tagiva</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 700; color: #ffffff; background-color: ${badgeColor}; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.05em;">
                      ${escapeHtml(badgeText)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 17px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
                ${escapeHtml(titleText)}
              </h2>

              <p style="margin: 0 0 16px; font-size: 14px; color: #334155; line-height: 1.6;">
                ${isId ? `Halo ${escapeHtml(userName)},` : `Hello ${escapeHtml(userName)},`}
              </p>

              <p style="margin: 0 0 24px; font-size: 14px; color: #334155; line-height: 1.6;">
                ${bodyText}
              </p>

              <!-- Expiry Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #64748b;">${isId ? 'Paket Aktif' : 'Active Plan'}</td>
                        <td align="right" style="font-weight: 600; color: #0f172a;">Tagiva Pro (${planDurationMonths} Bulan)</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 6px; color: #64748b;">${isAutoRenew ? (isId ? 'Tanggal Penagihan' : 'Billing Date') : (isId ? 'Berakhir Pada' : 'Expires On')}</td>
                        <td align="right" style="padding-top: 6px; font-weight: 600; color: #0f172a;">${formattedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; margin: 28px 0 12px;">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                  ${escapeHtml(ctaText)} &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Tagiva • Simple invoicing for Indonesian freelancers and small businesses.<br>
                <a href="https://tagiva.com" target="_blank" rel="noopener noreferrer" style="color: #64748b; text-decoration: none;">tagiva.com</a>
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
