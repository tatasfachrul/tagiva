import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTodayWibString, getDaysUntilDateWib } from '@/lib/domain/timezone';
import { sendEmail } from '@/lib/email/client';
import {
  renderSubscriptionReminderEmailHtml,
  getReminderEmailSubject,
  type ReminderType,
} from '@/lib/email/templates/subscription-reminder-email';

/**
 * GET /api/cron/daily
 *
 * Daily Vercel Cron Job running at 08:00 WIB (01:00 UTC) (D-26, D-50, D-52, D-53)
 *
 * Implements:
 * 1. Expire elapsed subscriptions (status = 'expired') (D-23, D-52)
 * 2. Mark overdue invoices (due_date < today WIB) (D-15)
 * 3. Dispatch deduplicated 30d/14d/3d/0d manual reminders and 3d auto-renew notices (D-26, D-53)
 * 4. Timing-safe verification of CRON_SECRET (SECURITY.md Section 6.2)
 */
export async function GET(request: Request) {
  // 1. Timing-Safe CRON_SECRET Verification (SECURITY.md Section 6.2)
  const cronSecret = process.env.CRON_SECRET || 'mock-cron-secret';
  const authHeader = request.headers.get('authorization') || '';
  const expectedAuth = `Bearer ${cronSecret}`;

  if (process.env.NODE_ENV !== 'test') {
    const bufExpected = Buffer.from(expectedAuth);
    const bufReceived = Buffer.from(authHeader);

    const isValid =
      bufExpected.length === bufReceived.length &&
      crypto.timingSafeEqual(bufExpected, bufReceived);

    if (!isValid) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  const supabaseAdmin = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const todayWib = getTodayWibString(now);

  let expiredCount = 0;
  let overdueCount = 0;
  let remindersSentCount = 0;

  try {
    // -------------------------------------------------------------
    // Task 1: Expire Elapsed Subscriptions (D-23, D-52)
    // -------------------------------------------------------------
    // 1a. Active or cancelled subscriptions whose paid period has elapsed
    const { data: expiredSubs } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updated_at: nowIso })
      .in('status', ['active', 'cancelled'])
      .lte('current_period_end', nowIso)
      .select('id');

    expiredCount += expiredSubs?.length ?? 0;

    // 1b. Past_due subscriptions whose 3-day grace period has elapsed (D-52)
    const { data: expiredGraceSubs } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'expired', updated_at: nowIso })
      .eq('status', 'past_due')
      .lte('grace_period_end', nowIso)
      .select('id');

    expiredCount += expiredGraceSubs?.length ?? 0;

    // -------------------------------------------------------------
    // Task 2: Batch Mark Overdue Invoices (D-15, FR-5.8)
    // -------------------------------------------------------------
    const { data: overdueInvoices } = await supabaseAdmin
      .from('invoices')
      .update({ status: 'overdue', updated_at: nowIso })
      .eq('status', 'sent')
      .lt('due_date', todayWib)
      .select('id');

    overdueCount = overdueInvoices?.length ?? 0;

    // -------------------------------------------------------------
    // Task 3: Subscription Expiry & Renewal Reminders (D-26, D-53)
    // -------------------------------------------------------------
    // Fetch active subscriptions with user profile details
    const { data: activeSubs } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_duration_months,
        billing_mode,
        current_period_end,
        profiles (
          business_name,
          email,
          default_language
        )
      `)
      .eq('status', 'active');

    if (activeSubs && activeSubs.length > 0) {
      for (const sub of activeSubs) {
        const periodEndDateWib = getTodayWibString(new Date(sub.current_period_end));
        const daysRemaining = getDaysUntilDateWib(periodEndDateWib, todayWib);

        let targetReminderType: ReminderType | null = null;

        if (sub.billing_mode === 'auto_renew') {
          // Auto-renewal accounts only get the 3d advance charge notice (D-53, TC-BILL-05)
          if (daysRemaining === 3) {
            targetReminderType = 'auto_renew_3d';
          }
        } else {
          // Manual payment accounts get 30d, 14d, 3d, 0d reminders (D-26, TC-BILL-04)
          if (daysRemaining === 30) {
            targetReminderType = '30d';
          } else if (daysRemaining === 14) {
            targetReminderType = '14d';
          } else if (daysRemaining === 3) {
            targetReminderType = '3d';
          } else if (daysRemaining === 0) {
            targetReminderType = '0d';
          }
        }

        if (!targetReminderType) {
          continue;
        }

        // Check if reminder was already recorded/sent for this cycle (Deduplication, A-21)
        const { data: existingReminder } = await supabaseAdmin
          .from('subscription_reminders')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('period_end_date_wib', periodEndDateWib)
          .eq('reminder_type', targetReminderType)
          .maybeSingle();

        if (existingReminder) {
          continue; // Already sent, skip
        }

        const profile = Array.isArray(sub.profiles)
          ? sub.profiles[0]
          : sub.profiles;

        const recipientEmail = profile?.email;
        if (!recipientEmail) {
          continue;
        }

        const language = (profile?.default_language as 'en' | 'id') || 'en';
        const userName = profile?.business_name || 'Subscriber';

        const subject = getReminderEmailSubject(targetReminderType, language);
        const html = renderSubscriptionReminderEmailHtml({
          userName,
          reminderType: targetReminderType,
          periodEndDate: sub.current_period_end,
          planDurationMonths: sub.plan_duration_months,
          language,
        });

        // Dispatch transactional email via Resend
        await sendEmail({
          from: 'Tagiva <invoices@tagiva.com>',
          to: recipientEmail,
          subject,
          html,
        });

        // Record in subscription_reminders to prevent duplicate dispatch
        await supabaseAdmin.from('subscription_reminders').insert({
          subscription_id: sub.id,
          user_id: sub.user_id,
          period_end_date_wib: periodEndDateWib,
          reminder_type: targetReminderType,
          sent_at: nowIso,
        });

        remindersSentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: nowIso,
      todayWib,
      expiredCount,
      overdueCount,
      remindersSentCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cron execution failed';
    console.error('Daily cron error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
