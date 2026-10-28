/**
 * Tagiva - File Magic-Byte & MIME Validation
 *
 * Implements SEC-5 & A-06:
 * - Strictly inspects buffer magic bytes for allowed image formats (PNG, JPEG, WEBP)
 * - Hard-rejects SVG (<svg, <?xml) and spoofed extensions to prevent Stored XSS / XXE
 * - Enforces 2 MB size limits (2,097,152 bytes)
 */

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export type AllowedImageFormat = 'png' | 'jpeg' | 'webp';

export interface FileValidationResult {
  valid: boolean;
  format?: AllowedImageFormat;
  mimeType?: string;
  error?: string;
}

/**
 * Validates an image buffer by inspecting its magic bytes (file signature).
 */
export function validateImageBuffer(buffer: Buffer | Uint8Array): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds maximum allowed size of 2 MB.' };
  }

  if (buffer.length < 12) {
    return { valid: false, error: 'File is too small to be a valid image.' };
  }

  const bytes = buffer instanceof Buffer ? buffer : Buffer.from(buffer);

  // 1. Check for PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { valid: true, format: 'png', mimeType: 'image/png' };
  }

  // 2. Check for JPEG signature: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: true, format: 'jpeg', mimeType: 'image/jpeg' };
  }

  // 3. Check for WEBP signature: "RIFF" at 0..3 and "WEBP" at 8..11
  const isRiff =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46; // RIFF
  const isWebp =
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50; // WEBP

  if (isRiff && isWebp) {
    return { valid: true, format: 'webp', mimeType: 'image/webp' };
  }

  // 4. Specifically detect forbidden SVG or HTML content to give clear feedback
  const headerText = bytes.subarray(0, 100).toString('utf-8').trim().toLowerCase();
  if (
    headerText.includes('<svg') ||
    headerText.includes('<?xml') ||
    headerText.includes('<!doctype svg')
  ) {
    return {
      valid: false,
      error: 'SVG format is not allowed for security reasons. Please upload PNG, JPG, or WebP.',
    };
  }

  if (headerText.includes('<html') || headerText.includes('<!doctype html')) {
    return {
      valid: false,
      error: 'HTML files are strictly disallowed.',
    };
  }

  return {
    valid: false,
    error: 'Unsupported image format. Only PNG, JPEG, and WebP are allowed.',
  };
}
