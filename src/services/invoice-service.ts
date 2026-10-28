/**
 * Tagiva - Invoice Database Service
 *
 * Encapsulates all database interactions (queries, RPCs, transactions) for Invoices,
 * line items, and customers.
 *
 * Decouples domain logic, server actions, and frontend hooks from Supabase.
 */

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserPlanState } from '@/lib/domain/entitlements';
import type { InvoiceStatus } from '@/lib/domain/status';

export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
export type InvoiceItemRow = Database['public']['Tables']['invoice_items']['Row'];
export type CustomerRow = Database['public']['Tables']['customers']['Row'];

export interface InvoiceItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceWithItems extends InvoiceRow {
  invoice_items: InvoiceItemRow[];
}

export interface CustomerPayload {
  name: string;
  company?: string;
  email?: string;
  address?: string;
}

export const InvoiceService = {
  /**
   * Helper to resolve the database client (accepts injected client for testing/reusability)
   */
  async getClient(client?: SupabaseClient<Database>): Promise<SupabaseClient<Database>> {
    if (client) return client;
    return createClient();
  },

  /**
   * Resolves the subscription plan state ('free' | 'pro' | 'lapsed') for a user.
   */
  async getUserPlanState(
    userId: string,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<UserPlanState> {
    const supabase = await this.getClient(injectedClient);
    const { data } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: { p_user_id: string },
      ) => Promise<{ data: UserPlanState | null; error: unknown }>
    )('get_user_plan_state', { p_user_id: userId });

    return data || 'free';
  },

  /**
   * Fetches an invoice by ID belonging to a specific user.
   */
  async getInvoiceById(
    invoiceId: string,
    userId: string,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<InvoiceRow | null> {
    const supabase = await this.getClient(injectedClient);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data as InvoiceRow;
  },

  /**
   * Fetches an invoice and its line items.
   */
  async getInvoiceWithItems(
    invoiceId: string,
    userId: string,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<{ invoice: InvoiceRow; items: InvoiceItemRow[] } | null> {
    const supabase = await this.getClient(injectedClient);
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (invoiceError || !invoice) return null;

    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('sort_order', { ascending: true });

    if (itemsError) return null;

    return {
      invoice: invoice as InvoiceRow,
      items: (items || []) as InvoiceItemRow[],
    };
  },

  /**
   * Returns total count of invoices owned by user (used for free tier cap enforcement).
   */
  async countUserInvoices(
    userId: string,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<number> {
    const supabase = await this.getClient(injectedClient);
    const { count } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    return count ?? 0;
  },

  /**
   * Retrieves user's profile logo url for snapshotting into new invoices.
   */
  async getUserLogo(
    userId: string,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<string | null> {
    const supabase = await this.getClient(injectedClient);
    const { data: profile } = await supabase
      .from('profiles')
      .select('logo_url')
      .eq('user_id', userId)
      .single();

    return profile?.logo_url ?? null;
  },

  /**
   * Upserts client contact information into the customers table directory.
   */
  async upsertCustomer(
    userId: string,
    customer: CustomerPayload,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<string | null> {
    if (!customer.name) return null;

    const supabase = await this.getClient(injectedClient);
    const { data: newCustomer } = await supabase
      .from('customers')
      .upsert(
        {
          user_id: userId,
          name: customer.name,
          company: customer.company ?? '',
          email: customer.email ?? '',
          address: customer.address ?? '',
        },
        { onConflict: 'user_id,email' },
      )
      .select('id')
      .single();

    return newCustomer?.id ?? null;
  },

  /**
   * Creates a new draft invoice and its corresponding line items.
   */
  async createDraftInvoice(
    invoiceData: InvoiceInsert,
    items: InvoiceItemPayload[],
    injectedClient?: SupabaseClient<Database>,
  ): Promise<{ id: string; status: InvoiceStatus }> {
    const supabase = await this.getClient(injectedClient);

    const { data: newInvoice, error: insertError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select('id, status')
      .single();

    if (insertError || !newInvoice) {
      throw new Error(insertError?.message || 'Failed to create invoice draft.');
    }

    if (items.length > 0) {
      const itemsToInsert = items.map((item, idx) => ({
        invoice_id: newInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
        sort_order: idx + 1,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw new Error(itemsError.message || 'Failed to insert invoice items.');
      }
    }

    return {
      id: newInvoice.id,
      status: newInvoice.status as InvoiceStatus,
    };
  },

  /**
   * Updates an existing invoice and replaces its line items.
   */
  async updateInvoice(
    invoiceId: string,
    userId: string,
    invoiceData: InvoiceUpdate,
    items: InvoiceItemPayload[],
    injectedClient?: SupabaseClient<Database>,
  ): Promise<void> {
    const supabase = await this.getClient(injectedClient);

    const { error: updateError } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(updateError.message || 'Failed to update invoice.');
    }

    // Delete existing line items
    const { error: deleteItemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);

    if (deleteItemsError) {
      throw new Error(deleteItemsError.message || 'Failed to clear old invoice items.');
    }

    // Insert new line items
    if (items.length > 0) {
      const itemsToInsert = items.map((item, idx) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
        sort_order: idx + 1,
      }));

      const { error: insertItemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (insertItemsError) {
        throw new Error(insertItemsError.message || 'Failed to save updated invoice items.');
      }
    }
  },

  /**
   * Invokes the atomic PostgreSQL RPC to assign permanent sequence number and mark as sent.
   */
  async issueInvoice(
    invoiceId: string,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<string> {
    const supabase = await this.getClient(injectedClient);

    const { data: issuedNumber, error: rpcError } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: { p_invoice_id: string },
      ) => Promise<{ data: string | null; error: { message: string } | null }>
    )('issue_invoice', { p_invoice_id: invoiceId });

    if (rpcError || !issuedNumber) {
      throw new Error(rpcError?.message || 'Failed to issue invoice sequence number.');
    }

    return issuedNumber;
  },

  /**
   * Updates the status of an issued invoice ('sent' or 'paid').
   */
  async updateInvoiceStatus(
    invoiceId: string,
    userId: string,
    status: 'sent' | 'paid',
    paidAt: string | null,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<void> {
    const supabase = await this.getClient(injectedClient);

    const { error } = await supabase
      .from('invoices')
      .update({
        status,
        paid_at: paidAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message || 'Failed to update invoice status.');
    }
  },

  /**
   * Permanently deletes an invoice and cascades to line items.
   */
  async deleteInvoice(
    invoiceId: string,
    userId: string,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<void> {
    const supabase = await this.getClient(injectedClient);

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message || 'Failed to delete invoice.');
    }
  },

  /**
   * Enables or disables public link sharing with an assigned cryptographic token.
   */
  async updatePublicLink(
    invoiceId: string,
    userId: string,
    token: string,
    enabled: boolean,
    injectedClient?: SupabaseClient<Database>,
  ): Promise<void> {
    const supabase = await this.getClient(injectedClient);

    const { error } = await supabase
      .from('invoices')
      .update({
        public_token: token,
        public_link_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message || 'Failed to update public link configuration.');
    }
  },
};
