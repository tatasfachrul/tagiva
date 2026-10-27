/**
 * Tagiva - Business Profile Validation Schemas
 *
 * Implements Zod validation schemas for profile settings and onboarding
 * as specified in API.md Section 3.1.
 */

import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '../domain/calculations';

export const INVOICE_PREFIX_REGEX = /^[A-Z0-9]{2,6}$/;

export const BankDetailsSchema = z.object({
  bankName: z.string().trim().max(80, 'Bank name cannot exceed 80 characters').default(''),
  accountNumber: z.string().trim().max(60, 'Account number cannot exceed 60 characters').default(''),
  accountHolder: z.string().trim().max(120, 'Account holder name cannot exceed 120 characters').default(''),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').default(''),
});

export const UpdateBusinessProfileSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, 'Business name is required')
    .max(120, 'Business name cannot exceed 120 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .or(z.literal(''))
    .default(''),
  phone: z.string().trim().max(40, 'Phone cannot exceed 40 characters').default(''),
  address: z.string().trim().max(500, 'Address cannot exceed 500 characters').default(''),
  taxId: z.string().trim().max(60, 'Tax ID/NPWP cannot exceed 60 characters').default(''),
  invoicePrefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(INVOICE_PREFIX_REGEX, 'Invoice prefix must be 2 to 6 uppercase letters or numbers (A-Z, 0-9)'),
  defaultCurrency: z.enum(SUPPORTED_CURRENCIES),
  defaultLanguage: z.enum(['en', 'id']),
  bankDetails: BankDetailsSchema.default({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    notes: '',
  }),
});

export type BankDetailsInput = z.infer<typeof BankDetailsSchema>;
export type UpdateBusinessProfileInput = z.infer<typeof UpdateBusinessProfileSchema>;

/**
 * File validation constraints for business logo upload (A-06, API.md 3.1)
 */
export const LOGO_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
