/**
 * Tagiva - Invoice Validation Schemas
 *
 * Implements Zod validation schemas for invoice mutations and sharing actions
 * as specified in API.md Section 3.2 & Section 3.3.
 */

import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '../domain/calculations';

export const LineItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Item description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a valid number' })
    .positive('Quantity must be greater than zero')
    .max(99999999, 'Quantity is too large'),
  unitPrice: z
    .number({ invalid_type_error: 'Unit price must be a valid number' })
    .min(0, 'Unit price cannot be negative')
    .max(999999999999, 'Unit price is too large'),
});

export const SenderDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Sender name is required').max(120),
  email: z.string().trim().email('Invalid sender email').or(z.literal('')).default(''),
  phone: z.string().trim().max(40).default(''),
  address: z.string().trim().max(500).default(''),
  taxId: z.string().trim().max(60).default(''),
  paymentInstructions: z.record(z.string(), z.string()).default({}),
});

export const ClientDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Client contact name is required').max(120),
  company: z.string().trim().max(120).default(''),
  email: z.string().trim().email('Invalid client email').or(z.literal('')).default(''),
  address: z.string().trim().max(500).default(''),
});

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const SaveInvoiceSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid().nullable().optional(),
  saveCustomerToDirectory: z.boolean().default(false),
  language: z.enum(['en', 'id']).default('en'),
  currency: z.enum(SUPPORTED_CURRENCIES).default('IDR'),
  issueDate: z.string().regex(DATE_REGEX, 'Issue date must be in YYYY-MM-DD format'),
  dueDate: z.string().regex(DATE_REGEX, 'Due date must be in YYYY-MM-DD format'),
  sender: SenderDetailsSchema,
  client: ClientDetailsSchema,
  items: z
    .array(LineItemSchema)
    .min(1, 'Invoice must contain at least one line item')
    .max(100, 'Invoice cannot exceed 100 line items'),
  discountType: z.enum(['percent', 'fixed']).default('percent'),
  discountValue: z.number().min(0, 'Discount cannot be negative').default(0),
  taxLabel: z.string().trim().max(30).default('PPN'),
  taxRate: z
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .default(0),
  notes: z.string().trim().max(1000).default(''),
});

export const IssueInvoiceSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
});

export const UpdateInvoiceStatusSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  targetStatus: z.enum(['sent', 'paid'], {
    errorMap: () => ({ message: "Target status must be 'sent' or 'paid'" }),
  }),
});

export const DeleteInvoiceSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
});

export const DuplicateInvoiceSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
});

export const CreateOrTogglePublicLinkSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  enabled: z.boolean(),
});

export const SendInvoiceEmailSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  recipientEmail: z.string().trim().email('Please enter a valid recipient email address'),
  subject: z
    .string()
    .trim()
    .min(1, 'Email subject is required')
    .max(160, 'Subject cannot exceed 160 characters'),
  message: z.string().trim().max(1000, 'Message cannot exceed 1000 characters').default(''),
});

export type LineItemInput = z.infer<typeof LineItemSchema>;
export type SenderDetailsInput = z.infer<typeof SenderDetailsSchema>;
export type ClientDetailsInput = z.infer<typeof ClientDetailsSchema>;
export type SaveInvoiceInput = z.infer<typeof SaveInvoiceSchema>;
export type IssueInvoiceInput = z.infer<typeof IssueInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof UpdateInvoiceStatusSchema>;
export type DeleteInvoiceInput = z.infer<typeof DeleteInvoiceSchema>;
export type DuplicateInvoiceInput = z.infer<typeof DuplicateInvoiceSchema>;
export type CreateOrTogglePublicLinkInput = z.infer<typeof CreateOrTogglePublicLinkSchema>;
export type SendInvoiceEmailInput = z.infer<typeof SendInvoiceEmailSchema>;
