'use client';

/**
 * Tagiva - Business Logo Uploader
 *
 * Implements:
 * - Pro feature gate with PRO lock pill (D-04, D-11)
 * - File picker restricted to PNG, JPG, WebP <= 2 MB (A-06, SEC-5)
 * - Immediate upload via uploadBusinessLogoAction
 * - Remove logo via removeBusinessLogoAction
 */

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Image as ImageIcon, Lock, Sparkles, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadBusinessLogoAction, removeBusinessLogoAction } from '@/features/settings/actions';
import type { UserPlanState } from '@/lib/domain/entitlements';

interface LogoUploaderProps {
  initialLogoUrl: string | null;
  planState: UserPlanState;
}

export function LogoUploader({ initialLogoUrl, planState }: LogoUploaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPro = planState === 'pro';

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side quick checks
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please upload a valid PNG, JPG, or WebP image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 2 MB limit.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadBusinessLogoAction(formData);

      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsUploading(false);
        return;
      }

      setLogoUrl(result.data.logoUrl);
      setSuccessMessage('Business logo updated successfully.');
      setIsUploading(false);
    } catch {
      setErrorMessage('Failed to upload logo. Please try again.');
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleRemove() {
    try {
      setIsRemoving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const result = await removeBusinessLogoAction();
      if (!result.ok) {
        setErrorMessage(result.error.message);
        setIsRemoving(false);
        return;
      }

      setLogoUrl(null);
      setSuccessMessage('Logo removed.');
      setIsRemoving(false);
    } catch {
      setErrorMessage('Failed to remove logo.');
      setIsRemoving(false);
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Business Logo</span>
              {!isPro && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  <Lock className="h-3 w-3" />
                  PRO
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Upload your company logo to appear on all newly issued invoices and PDFs.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Logo Preview Area */}
          <div className="h-24 w-24 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Business Logo"
                width={96}
                height={96}
                className="h-full w-full object-contain p-1"
                unoptimized
              />
            ) : (
              <div className="text-center p-2 text-slate-400">
                <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-60" />
                <span className="text-[10px] block leading-tight">No logo</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {isPro ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-file-input"
                  disabled={isUploading || isRemoving}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isRemoving}
                  className="gap-1.5 text-xs font-medium border-slate-300"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isUploading ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                </Button>

                {logoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemove}
                    disabled={isUploading || isRemoving}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{isRemoving ? 'Removing...' : 'Remove'}</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-medium border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50"
                >
                  <Link href="/settings/billing">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Upgrade to Pro to Upload Logo</span>
                  </Link>
                </Button>
                <p className="text-[11px] text-slate-500">
                  Custom logo upload requires an active Tagiva Pro subscription.
                </p>
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              Allowed: PNG, JPG, or WebP. Max 2 MB. Square or landscape orientation recommended.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
