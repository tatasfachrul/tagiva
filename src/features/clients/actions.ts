'use server';

/**
 * Tagiva - Clients Directory Server Actions
 *
 * Implements CRUD actions for customer records (FR-5.11).
 */

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { ok, err, validationError, type ActionResult } from '@/lib/api/action-result';
import type { CustomerRow } from '@/types/database';

const ClientInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'Contact name is required').max(120),
  company: z.string().trim().max(120).default(''),
  email: z.string().trim().email('Invalid email address').or(z.literal('')).default(''),
  address: z.string().trim().max(500).default(''),
});

export type ClientInput = z.infer<typeof ClientInputSchema>;

export async function saveClientAction(
  input: ClientInput,
): Promise<ActionResult<CustomerRow>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return err('UNAUTHENTICATED', 'Please sign in to manage clients.');
    }

    const parsed = ClientInputSchema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const supabase = await createClient();

    if (parsed.data.id) {
      // Update existing client
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: parsed.data.name,
          company: parsed.data.company,
          email: parsed.data.email,
          address: parsed.data.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', parsed.data.id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error || !data) {
        console.error('Failed to update client:', error);
        return err('INTERNAL_ERROR', 'Failed to update client details. Please try again.');
      }

      revalidatePath('/clients');
      return ok(data);
    }

    // Create new client
    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        company: parsed.data.company,
        email: parsed.data.email,
        address: parsed.data.address,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Failed to create client:', error);
      return err('INTERNAL_ERROR', 'Failed to save new client. Please try again.');
    }

    revalidatePath('/clients');
    return ok(data);
  } catch (error) {
    console.error('Unexpected error in saveClientAction:', error);
    return err('INTERNAL_ERROR', 'Failed to save client details. Please try again.');
  }
}

export async function deleteClientAction(
  clientId: string,
): Promise<ActionResult<{ success: true }>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return err('UNAUTHENTICATED', 'Please sign in to delete clients.');
    }

    if (!clientId) {
      return err('VALIDATION_ERROR', 'Client ID is required.');
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', clientId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete client:', error);
      return err('INTERNAL_ERROR', 'Failed to delete client. Please try again.');
    }

    revalidatePath('/clients');
    return ok({ success: true });
  } catch (error) {
    console.error('Unexpected error in deleteClientAction:', error);
    return err('INTERNAL_ERROR', 'Failed to delete client. Please try again.');
  }
}
