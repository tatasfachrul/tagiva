import { describe, it, expect } from 'vitest';
import {
  UpdateBusinessProfileSchema,
  INVOICE_PREFIX_REGEX,
} from '../profile';
import {
  SaveInvoiceSchema,
  UpdateInvoiceStatusSchema,
  SendInvoiceEmailSchema,
  IssueInvoiceSchema,
} from '../invoice';
import {
  CreateSubscriptionCheckoutSchema,
  CancelAutoRenewSchema,
} from '../billing';
import { ok, err, formatZodError, validationError } from '../../api/action-result';

describe('Profile Validation (UpdateBusinessProfileSchema)', () => {
  it('accepts valid profile with full details', () => {
    const validData = {
      businessName: 'Acme Studio',
      email: 'hello@acme.com',
      phone: '+628123456789',
      address: 'Jl. Sudirman No. 1, Jakarta',
      taxId: '01.234.567.8-901.000',
      invoicePrefix: 'ACME',
      defaultCurrency: 'IDR' as const,
      defaultLanguage: 'id' as const,
      bankDetails: {
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'Acme Studio PT',
        notes: 'Transfer within 14 days',
      },
    };

    const result = UpdateBusinessProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('enforces prefix rules: 2-6 uppercase alphanumeric (D-54)', () => {
    expect(INVOICE_PREFIX_REGEX.test('IN')).toBe(true);
    expect(INVOICE_PREFIX_REGEX.test('INV')).toBe(true);
    expect(INVOICE_PREFIX_REGEX.test('TAG123')).toBe(true);

    // Invalid prefixes
    expect(INVOICE_PREFIX_REGEX.test('I')).toBe(false); // too short
    expect(INVOICE_PREFIX_REGEX.test('TOOLONG1')).toBe(false); // > 6 chars
    expect(INVOICE_PREFIX_REGEX.test('inv')).toBe(false); // lowercase
    expect(INVOICE_PREFIX_REGEX.test('IN-01')).toBe(false); // special char
  });

  it('rejects empty businessName', () => {
    const invalid = {
      businessName: '   ',
      invoicePrefix: 'INV',
      defaultCurrency: 'IDR',
      defaultLanguage: 'en',
    };
    const result = UpdateBusinessProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email address', () => {
    const invalid = {
      businessName: 'Acme',
      email: 'not-an-email',
      invoicePrefix: 'INV',
      defaultCurrency: 'IDR',
      defaultLanguage: 'en',
    };
    const result = UpdateBusinessProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('Invoice Validation (SaveInvoiceSchema)', () => {
  const baseValidInvoice = {
    language: 'en' as const,
    currency: 'IDR' as const,
    issueDate: '2026-10-27',
    dueDate: '2026-11-10',
    sender: {
      name: 'John Doe Freelance',
      email: 'john@example.com',
      phone: '08123456789',
      address: 'Bandung',
      taxId: '',
      paymentInstructions: {},
    },
    client: {
      name: 'Client Corp',
      company: 'Client Corp Ltd',
      email: 'billing@clientcorp.com',
      address: 'Jakarta',
    },
    items: [
      {
        description: 'Web Application Development',
        quantity: 1,
        unitPrice: 15000000,
      },
    ],
    discountType: 'percent' as const,
    discountValue: 0,
    taxLabel: 'PPN',
    taxRate: 11,
    notes: 'Thank you for your business.',
  };

  it('accepts complete valid invoice input', () => {
    const result = SaveInvoiceSchema.safeParse(baseValidInvoice);
    expect(result.success).toBe(true);
  });

  it('rejects invalid date formats', () => {
    const invalidDate = {
      ...baseValidInvoice,
      issueDate: '27/10/2026', // must be YYYY-MM-DD
    };
    const result = SaveInvoiceSchema.safeParse(invalidDate);
    expect(result.success).toBe(false);
  });

  it('requires at least 1 line item', () => {
    const noItems = {
      ...baseValidInvoice,
      items: [],
    };
    const result = SaveInvoiceSchema.safeParse(noItems);
    expect(result.success).toBe(false);
  });

  it('rejects item with non-positive quantity or negative price', () => {
    const badQty = {
      ...baseValidInvoice,
      items: [{ description: 'Test', quantity: 0, unitPrice: 100 }],
    };
    expect(SaveInvoiceSchema.safeParse(badQty).success).toBe(false);

    const badPrice = {
      ...baseValidInvoice,
      items: [{ description: 'Test', quantity: 1, unitPrice: -50 }],
    };
    expect(SaveInvoiceSchema.safeParse(badPrice).success).toBe(false);
  });

  it('rejects taxRate exceeding 100%', () => {
    const badTax = {
      ...baseValidInvoice,
      taxRate: 105,
    };
    const result = SaveInvoiceSchema.safeParse(badTax);
    expect(result.success).toBe(false);
  });
});

describe('Invoice Status & Actions Validation', () => {
  it('validates targetStatus in UpdateInvoiceStatusSchema (only sent or paid)', () => {
    const validSent = {
      invoiceId: 'c7c88b02-5c9f-4318-8f8e-6e84e5fcb51e',
      targetStatus: 'sent',
    };
    expect(UpdateInvoiceStatusSchema.safeParse(validSent).success).toBe(true);

    const validPaid = {
      invoiceId: 'c7c88b02-5c9f-4318-8f8e-6e84e5fcb51e',
      targetStatus: 'paid',
    };
    expect(UpdateInvoiceStatusSchema.safeParse(validPaid).success).toBe(true);

    const invalidDraft = {
      invoiceId: 'c7c88b02-5c9f-4318-8f8e-6e84e5fcb51e',
      targetStatus: 'draft', // cannot revert to draft
    };
    expect(UpdateInvoiceStatusSchema.safeParse(invalidDraft).success).toBe(false);
  });

  it('validates email payload in SendInvoiceEmailSchema', () => {
    const valid = {
      invoiceId: 'c7c88b02-5c9f-4318-8f8e-6e84e5fcb51e',
      recipientEmail: 'finance@client.com',
      subject: 'Invoice #INV-2026-0001',
      message: 'Please find attached invoice.',
    };
    expect(SendInvoiceEmailSchema.safeParse(valid).success).toBe(true);

    const invalidEmail = {
      ...valid,
      recipientEmail: 'not-an-email',
    };
    expect(SendInvoiceEmailSchema.safeParse(invalidEmail).success).toBe(false);

    const emptySubject = {
      ...valid,
      subject: '   ',
    };
    expect(SendInvoiceEmailSchema.safeParse(emptySubject).success).toBe(false);
  });

  it('requires valid UUID for IssueInvoiceSchema', () => {
    expect(IssueInvoiceSchema.safeParse({ invoiceId: 'not-a-uuid' }).success).toBe(false);
    expect(IssueInvoiceSchema.safeParse({ invoiceId: 'c7c88b02-5c9f-4318-8f8e-6e84e5fcb51e' }).success).toBe(true);
  });
});

describe('Billing Validation (CreateSubscriptionCheckoutSchema)', () => {
  it('accepts canonical durations 1, 3, 6, 12 months with manual or auto_renew', () => {
    expect(CreateSubscriptionCheckoutSchema.safeParse({ durationMonths: 1, billingMode: 'manual' }).success).toBe(true);
    expect(CreateSubscriptionCheckoutSchema.safeParse({ durationMonths: 3, billingMode: 'auto_renew' }).success).toBe(true);
    expect(CreateSubscriptionCheckoutSchema.safeParse({ durationMonths: 6, billingMode: 'manual' }).success).toBe(true);
    expect(CreateSubscriptionCheckoutSchema.safeParse({ durationMonths: 12, billingMode: 'auto_renew' }).success).toBe(true);
  });

  it('rejects non-canonical durations (e.g., 2, 5, 24 months)', () => {
    expect(CreateSubscriptionCheckoutSchema.safeParse({ durationMonths: 2, billingMode: 'manual' }).success).toBe(false);
    expect(CreateSubscriptionCheckoutSchema.safeParse({ durationMonths: 24, billingMode: 'auto_renew' }).success).toBe(false);
  });

  it('validates CancelAutoRenewSchema requires UUID', () => {
    expect(CancelAutoRenewSchema.safeParse({ subscriptionId: 'invalid' }).success).toBe(false);
    expect(CancelAutoRenewSchema.safeParse({ subscriptionId: 'c7c88b02-5c9f-4318-8f8e-6e84e5fcb51e' }).success).toBe(true);
  });
});

describe('ActionResult Helpers', () => {
  it('ok() builds a success envelope', () => {
    const res = ok({ invoiceId: '123' });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.invoiceId).toBe('123');
    }
  });

  it('err() builds a failure envelope with ApiErrorCode', () => {
    const res = err('PLAN_LIMIT_REACHED', 'Cap reached', { invoice: ['Limit exceeded'] });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('PLAN_LIMIT_REACHED');
      expect(res.error.message).toBe('Cap reached');
      expect(res.error.fieldErrors?.invoice).toEqual(['Limit exceeded']);
    }
  });

  it('validationError() formats ZodError into fieldErrors map', () => {
    const schema = UpdateBusinessProfileSchema;
    const parsed = schema.safeParse({ businessName: '' });
    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      const fieldErrors = formatZodError(parsed.error);
      expect(fieldErrors.businessName).toBeDefined();

      const envelope = validationError(parsed.error);
      expect(envelope.ok).toBe(false);
      if (!envelope.ok) {
        expect(envelope.error.code).toBe('VALIDATION_ERROR');
        expect(envelope.error.fieldErrors?.businessName).toBeDefined();
      }
    }
  });
});
