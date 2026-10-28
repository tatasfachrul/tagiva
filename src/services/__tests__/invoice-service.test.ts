import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceService } from '../invoice-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

describe('InvoiceService', () => {
  let mockRpc: ReturnType<typeof vi.fn>;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockClient: SupabaseClient<Database>;

  beforeEach(() => {
    mockRpc = vi.fn();

    mockFrom = vi.fn().mockImplementation((_table: string) => {
      const builder: Record<string, unknown> = {};

      builder.select = vi.fn().mockImplementation((_fields?: string, options?: { count?: string; head?: boolean }) => {
        if (options?.head && options?.count === 'exact') {
          return {
            eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
          };
        }
        return {
          eq: vi.fn().mockImplementation((_col: string, val: string) => ({
            eq: vi.fn().mockImplementation((_col2: string, val2: string) => ({
              single: vi.fn().mockResolvedValue({
                data: { id: val, user_id: val2, status: 'draft', total_amount: 1000 },
                error: null,
              }),
            })),
            single: vi.fn().mockResolvedValue({
              data: { logo_url: 'https://tagiva.com/logo.png', default_currency: 'IDR' },
              error: null,
            }),
            order: vi.fn().mockResolvedValue({
              data: [{ id: 'item-1', invoice_id: val, description: 'Design service' }],
              error: null,
            }),
          })),
        };
      });

      builder.insert = vi.fn().mockImplementation((_data: unknown) => ({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'inv-new-1', status: 'draft' },
            error: null,
          }),
        }),
      }));

      builder.update = vi.fn().mockImplementation((_data: unknown) => ({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }));

      builder.delete = vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }));

      builder.upsert = vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'cust-1' },
            error: null,
          }),
        }),
      }));

      return builder;
    });

    mockClient = {
      from: mockFrom,
      rpc: mockRpc,
    } as unknown as SupabaseClient<Database>;
  });

  it('resolves user plan state via RPC', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'pro', error: null });

    const planState = await InvoiceService.getUserPlanState('user-1', mockClient);
    expect(planState).toBe('pro');
    expect(mockRpc).toHaveBeenCalledWith('get_user_plan_state', { p_user_id: 'user-1' });
  });

  it('counts user invoices accurately for entitlement checks', async () => {
    const count = await InvoiceService.countUserInvoices('user-1', mockClient);
    expect(count).toBe(2);
    expect(mockFrom).toHaveBeenCalledWith('invoices');
  });

  it('fetches an invoice by ID with ownership scope', async () => {
    const invoice = await InvoiceService.getInvoiceById('inv-123', 'user-1', mockClient);
    expect(invoice).toBeDefined();
    expect(invoice?.id).toBe('inv-123');
    expect(mockFrom).toHaveBeenCalledWith('invoices');
  });

  it('fetches an invoice along with its items', async () => {
    const res = await InvoiceService.getInvoiceWithItems('inv-123', 'user-1', mockClient);
    expect(res).toBeDefined();
    expect(res?.invoice.id).toBe('inv-123');
    expect(res?.items.length).toBeGreaterThan(0);
  });

  it('calls issue_invoice RPC when issuing an invoice', async () => {
    mockRpc.mockResolvedValueOnce({ data: 'INV-TAG-2026-10-0001', error: null });

    const issuedNumber = await InvoiceService.issueInvoice('inv-123', mockClient);
    expect(issuedNumber).toBe('INV-TAG-2026-10-0001');
    expect(mockRpc).toHaveBeenCalledWith('issue_invoice', { p_invoice_id: 'inv-123' });
  });

  it('updates invoice status cleanly', async () => {
    await expect(
      InvoiceService.updateInvoiceStatus('inv-123', 'user-1', 'paid', new Date().toISOString(), mockClient),
    ).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith('invoices');
  });

  it('deletes an invoice scoped to owner user_id', async () => {
    await expect(
      InvoiceService.deleteInvoice('inv-123', 'user-1', mockClient),
    ).resolves.toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith('invoices');
  });
});
