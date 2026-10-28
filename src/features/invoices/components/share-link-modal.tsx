'use client';

/**
 * Tagiva - Share Public Link Modal (FR-8, UX_FLOWS.md Section 3.4A)
 *
 * Provides:
 * - Public URL display
 * - 1-click "Copy Link" with clipboard feedback
 * - "Open in new tab" external link
 * - Instant link revocation / toggle (FR-8.4, SEC-PUB-4)
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Link2, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createOrTogglePublicLinkAction } from '../share-actions';

interface ShareLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  initialPublicUrl: string | null;
  initialEnabled: boolean;
  onLinkStatusChange?: (enabled: boolean, publicUrl: string | null) => void;
}

export function ShareLinkModal({
  open,
  onOpenChange,
  invoiceId,
  initialPublicUrl,
  initialEnabled,
  onLinkStatusChange,
}: ShareLinkModalProps) {
  const router = useRouter();
  const [publicUrl, setPublicUrl] = useState<string | null>(initialPublicUrl);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Sync state when props update
  React.useEffect(() => {
    setPublicUrl(initialPublicUrl);
    setIsEnabled(initialEnabled);
  }, [initialPublicUrl, initialEnabled]);

  async function handleToggle(enable: boolean) {
    setIsLoading(true);
    try {
      const res = await createOrTogglePublicLinkAction({
        invoiceId,
        enabled: enable,
      });

      if (res.ok) {
        setIsEnabled(res.data.enabled);
        setPublicUrl(res.data.enabled ? res.data.publicUrl : null);
        onLinkStatusChange?.(res.data.enabled, res.data.enabled ? res.data.publicUrl : null);
        toast.success(
          res.data.enabled
            ? 'Public link enabled! Anyone with this link can view the invoice.'
            : 'Public link revoked. The URL will now return 404.',
        );
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to update public link status.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setHasCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2">
            <Link2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center font-heading text-lg font-bold text-slate-900">
            Share Public Invoice Link
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-500">
            Give your client an unguessable link to view details and download the PDF without signing in.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isEnabled && publicUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {hasCopied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-600" />
                  )}
                  <span className="sr-only">Copy link</span>
                </Button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Open client view</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(false)}
                  disabled={isLoading}
                  className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  )}
                  Revoke Link
                </Button>
              </div>

              <div className="rounded-md bg-amber-50/70 p-3 text-[11px] text-amber-800 border border-amber-200/60 leading-relaxed">
                <strong>Privacy Note:</strong> This unguessable link is search-engine excluded (<code className="font-mono text-[10px]">noindex</code>). Revoking it immediately returns a 404.
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Public link sharing is currently disabled for this invoice. Generating a link will activate it.
              </p>
              <Button
                type="button"
                onClick={() => handleToggle(true)}
                disabled={isLoading}
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate & Enable Public Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
