'use client';

/**
 * Tagiva - Add / Edit Client Dialog Modal
 *
 * Implements client creation & editing (FR-5.11).
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { saveClientAction } from '@/features/clients/actions';
import type { CustomerRow } from '@/types/database';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: CustomerRow | null;
  onSuccess?: () => void;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: ClientFormDialogProps) {
  const isEditing = Boolean(client?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setCompany(client.company || '');
      setEmail(client.email || '');
      setAddress(client.address || '');
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setAddress('');
    }
    setErrorMessage(null);
  }, [client, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Contact name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await saveClientAction({
        id: client?.id,
        name: name.trim(),
        company: company.trim(),
        email: email.trim(),
        address: address.trim(),
      });

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      setErrorMessage('Failed to save client details.');
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {isEditing ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Save client details to quickly pre-fill future invoices.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorMessage && (
              <div className="rounded-md bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <Label htmlFor="clientName" className="text-xs font-semibold text-slate-800">
                Contact Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="clientName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="clientCompany" className="text-xs font-semibold text-slate-800">
                Company / Organization
              </Label>
              <Input
                id="clientCompany"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Nexus Media Pte Ltd"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="clientEmail" className="text-xs font-semibold text-slate-800">
                Email Address
              </Label>
              <Input
                id="clientEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@nexusmedia.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="clientAddress" className="text-xs font-semibold text-slate-800">
                Billing Address
              </Label>
              <Textarea
                id="clientAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Billing address, city, postal code"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-medium"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
