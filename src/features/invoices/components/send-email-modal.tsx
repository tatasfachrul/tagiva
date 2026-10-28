'use client';

/**
 * Tagiva - Send Invoice via Email Modal (FR-9, UX_FLOWS.md Section 3.4B)
 *
 * Implements:
 * - Pre-filled To, Subject, and polite Message in invoice's language (EN/ID)
 * - Automatic PDF attachment indicator & public link notice
 * - Dispatch via sendInvoiceEmailAction
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Paperclip, Send, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { sendInvoiceEmailAction } from '../email-actions';

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string | null;
  clientEmail: string;
  clientName: string;
  senderName: string;
  language?: 'en' | 'id';
  isDraft?: boolean;
  onEmailSent?: () => void;
}

export function SendEmailModal({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  clientEmail,
  senderName,
  language = 'en',
  isDraft = false,
  onEmailSent,
}: SendEmailModalProps) {
  const router = useRouter();
  const [recipient, setRecipient] = useState(clientEmail || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isId = language === 'id';
  const displayNum = invoiceNumber || (isDraft ? '[DRAFT]' : 'Invoice');
  const displaySender = senderName || 'Tagiva';

  // Compute default values when modal opens or props change
  useEffect(() => {
    setRecipient(clientEmail || '');

    const defaultSubject = isId
      ? `Faktur ${displayNum} dari ${displaySender}`
      : `Invoice ${displayNum} from ${displaySender}`;
    setSubject(defaultSubject);

    const defaultMessage = isId
      ? `Terlampir faktur untuk pembayaran Anda. Terima kasih atas kerja samanya!`
      : `Please find attached your invoice for review and payment. Thank you for your business!`;
    setMessage(defaultMessage);
  }, [clientEmail, displayNum, displaySender, isId, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!recipient.trim()) {
      toast.error('Please enter a recipient email address.');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter an email subject.');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendInvoiceEmailAction({
        invoiceId,
        recipientEmail: recipient.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.ok) {
        toast.success(`Invoice emailed successfully to ${recipient.trim()}!`);
        onOpenChange(false);
        onEmailSent?.();
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to send invoice email.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSend} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-slate-900 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Mail className="h-4 w-4" />
              </div>
              <DialogTitle className="font-heading text-lg font-bold">
                Send Invoice via Email
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Deliver this invoice directly to your client&apos;s inbox with the official PDF attached and a live public link included.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            {/* Recipient Field */}
            <div className="space-y-1.5">
              <Label htmlFor="recipientEmail" className="text-xs font-semibold text-slate-700">
                Recipient Email (To) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="recipientEmail"
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="client@company.com"
                className="text-xs font-sans h-9"
              />
            </div>

            {/* Subject Field */}
            <div className="space-y-1.5">
              <Label htmlFor="emailSubject" className="text-xs font-semibold text-slate-700">
                Subject <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="emailSubject"
                type="text"
                required
                maxLength={160}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-xs font-sans h-9"
              />
            </div>

            {/* Message Field */}
            <div className="space-y-1.5">
              <Label htmlFor="emailMessage" className="text-xs font-semibold text-slate-700">
                Custom Message (Optional)
              </Label>
              <Textarea
                id="emailMessage"
                rows={3}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs font-sans resize-none"
              />
            </div>

            {/* Attachment indicator box */}
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-mono text-[11px] font-medium text-slate-800">
                  {displayNum}.pdf
                </span>
                <span className="text-[10px] text-slate-400">(Auto-generated A4 PDF)</span>
              </div>
              <span className="text-[10px] bg-slate-200/60 font-semibold px-2 py-0.5 rounded text-slate-700">
                Attached
              </span>
            </div>

            {isDraft && (
              <div className="rounded-md bg-blue-50/80 p-2.5 text-[11px] text-blue-700 border border-blue-200/60 flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-600" />
                <span>
                  Sending this draft will assign its permanent invoice number and transition its status to <strong>Sent</strong>.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSending}
              className="text-xs bg-slate-900 text-white hover:bg-slate-800"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Sending Invoice...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
