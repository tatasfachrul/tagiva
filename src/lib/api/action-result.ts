/**
 * Tagiva - Action Result & Error Envelope
 *
 * Implements the standard discriminated union envelope for all Next.js Server Actions
 * as specified in API.md Section 2.
 */

import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'PLAN_LIMIT_REACHED'
  | 'PRO_REQUIRED'
  | 'LAPSED_READ_ONLY'
  | 'DELETE_NOT_ALLOWED_ON_FREE'
  | 'INVALID_STATUS_TRANSITION'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

export type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: ApiErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

/**
 * Creates a successful ActionResult envelope.
 */
export function ok<T>(data: T): ActionResult<T> {
  return {
    ok: true,
    data,
  };
}

/**
 * Creates a failed ActionResult envelope with an ApiErrorCode and optional field errors.
 */
export function err(
  code: ApiErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(fieldErrors && Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    },
  };
}

/**
 * Formats a ZodError into a flattened fieldErrors map: Record<fieldName, string[]>
 */
export function formatZodError(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
}

/**
 * Shorthand helper for returning a VALIDATION_ERROR ActionResult from a ZodError.
 */
export function validationError(
  error: ZodError,
  customMessage = 'Validation failed. Please check the form fields.',
): ActionResult<never> {
  return err('VALIDATION_ERROR', customMessage, formatZodError(error));
}
