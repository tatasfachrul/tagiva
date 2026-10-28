import { describe, it, expect } from 'vitest';
import { validateImageBuffer } from '../file-validation';

describe('File Validation & Magic-Byte Inspection (TC-SEC-02, A-06)', () => {
  it('accepts valid PNG image buffer', () => {
    // PNG signature + padding to > 12 bytes
    const pngSignature = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48,
      0x44, 0x52,
    ]);
    const result = validateImageBuffer(pngSignature);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('png');
    expect(result.mimeType).toBe('image/png');
  });

  it('accepts valid JPEG image buffer', () => {
    // JPEG signature: FF D8 FF E0 ...
    const jpegSignature = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]);
    const result = validateImageBuffer(jpegSignature);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('jpeg');
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('accepts valid WEBP image buffer', () => {
    // RIFF .... WEBP
    const webpSignature = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // file length
      0x57, 0x45, 0x42, 0x50, // "WEBP"
      0x56, 0x50, 0x38, 0x20, // "VP8 "
    ]);
    const result = validateImageBuffer(webpSignature);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('webp');
    expect(result.mimeType).toBe('image/webp');
  });

  it('TC-SEC-02: strictly rejects SVG files disguised as images', () => {
    const fakeSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const result = validateImageBuffer(fakeSvg);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/SVG format is not allowed/i);
  });

  it('TC-SEC-02: strictly rejects HTML files disguised as images', () => {
    const fakeHtml = Buffer.from('<!DOCTYPE html><html><body><h1>Fake PNG</h1></body></html>');
    const result = validateImageBuffer(fakeHtml);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/HTML files are strictly disallowed/i);
  });

  it('rejects files exceeding 2 MB', () => {
    const largeBuffer = Buffer.alloc(2 * 1024 * 1024 + 1); // 2 MB + 1 byte
    const result = validateImageBuffer(largeBuffer);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/maximum allowed size of 2 MB/i);
  });

  it('rejects empty or very small buffers', () => {
    expect(validateImageBuffer(Buffer.alloc(0)).valid).toBe(false);
    expect(validateImageBuffer(Buffer.from([0x01, 0x02])).valid).toBe(false);
  });
});
