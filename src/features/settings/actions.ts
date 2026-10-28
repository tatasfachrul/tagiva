'use server';

/**
 * Tagiva - Settings & Profile Server Actions
 *
 * Implements business profile updates, onboarding completion,
 * and Pro logo uploads with magic-byte verification (API.md Section 3.1, A-06).
 */

import { revalidatePath } from 'next/cache';
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server';
import {
  UpdateBusinessProfileSchema,
  type UpdateBusinessProfileInput,
} from '@/lib/validations/profile';
import { validateImageBuffer } from '@/lib/security/file-validation';
import { ok, err, validationError, type ActionResult } from '@/lib/api/action-result';
import type { ProfileRow } from '@/types/database';

export async function updateBusinessProfileAction(
  input: UpdateBusinessProfileInput,
): Promise<ActionResult<ProfileRow>> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return err('UNAUTHENTICATED', 'Please sign in with Google to continue.');
  }

  const parsed = UpdateBusinessProfileSchema.safeParse(input);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      business_name: parsed.data.businessName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      tax_id: parsed.data.taxId,
      invoice_prefix: parsed.data.invoicePrefix,
      default_currency: parsed.data.defaultCurrency,
      default_language: parsed.data.defaultLanguage,
      bank_details: {
        bank_name: parsed.data.bankDetails.bankName,
        account_number: parsed.data.bankDetails.accountNumber,
        account_holder: parsed.data.bankDetails.accountHolder,
        notes: parsed.data.bankDetails.notes,
      },
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error || !data) {
    return err('INTERNAL_ERROR', error?.message || 'Failed to update business profile.');
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/onboarding');

  return ok(data);
}

export async function skipOnboardingAction(): Promise<ActionResult<{ success: true }>> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return err('UNAUTHENTICATED', 'Please sign in with Google to continue.');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    return err('INTERNAL_ERROR', error.message);
  }

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');

  return ok({ success: true });
}

export async function uploadBusinessLogoAction(
  formData: FormData,
): Promise<ActionResult<{ logoUrl: string }>> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return err('UNAUTHENTICATED', 'Please sign in with Google to continue.');
  }

  const supabase = await createClient();

  // Enforce Pro entitlement on logo upload (D-04, D-11, API.md 3.1)
  const { data: planState, error: planError } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: { p_user_id: string },
    ) => Promise<{ data: string | null; error: { message: string } | null }>
  )('get_user_plan_state', {
    p_user_id: user.id,
  });

  if (planError || planState !== 'pro') {
    return err(
      'PRO_REQUIRED',
      'Uploading a custom business logo is exclusive to Tagiva Pro subscribers.',
    );
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return err('VALIDATION_ERROR', 'Please select a valid image file to upload.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Magic-byte inspection & format check (TC-SEC-02, A-06)
  const validation = validateImageBuffer(buffer);
  if (!validation.valid || !validation.format || !validation.mimeType) {
    return err('VALIDATION_ERROR', validation.error || 'Invalid image file.');
  }

  const fileExt = validation.format;
  const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage bucket 'business-logos'
  const { error: uploadError } = await supabase.storage
    .from('business-logos')
    .upload(fileName, buffer, {
      contentType: validation.mimeType,
      upsert: true,
    });

  if (uploadError) {
    return err('INTERNAL_ERROR', `Logo upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('business-logos').getPublicUrl(fileName);

  // Update profile logo_url
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      logo_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (updateError) {
    return err('INTERNAL_ERROR', `Failed to update profile logo: ${updateError.message}`);
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');

  return ok({ logoUrl: publicUrl });
}

export async function removeBusinessLogoAction(): Promise<ActionResult<{ success: true }>> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return err('UNAUTHENTICATED', 'Please sign in with Google to continue.');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      logo_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    return err('INTERNAL_ERROR', error.message);
  }

  revalidatePath('/settings');
  revalidatePath('/dashboard');

  return ok({ success: true });
}
