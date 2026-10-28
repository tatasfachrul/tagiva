/**
 * Tagiva - Resend Email Client Wrapper
 *
 * Implements transactional email sending with Resend.
 * In development or testing without RESEND_API_KEY, provides a graceful mock fallback.
 */

import { Resend } from 'resend';

export interface SendEmailPayload {
  from: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export interface SendEmailResult {
  id?: string;
  error?: string;
}

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'mock') {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const resend = getResendClient();

  if (!resend || process.env.NODE_ENV === 'test') {
    // In test environment or when API key is unset, return mock success
    return {
      id: `mock-resend-${Date.now()}`,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      replyTo: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { error: error.message };
    }

    return { id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email dispatch error';
    console.error('Failed to dispatch email via Resend:', message);
    return { error: message };
  }
}
