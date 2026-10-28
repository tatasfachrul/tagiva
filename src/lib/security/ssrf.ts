/**
 * Tagiva - SSRF Prevention for PDF Engine (D-49, SECURITY.md Section 5)
 *
 * Ensures the PDF renderer only loads images stored in the project's own
 * Supabase Storage bucket (`business-logos`). Arbitrary external URLs,
 * IP addresses, and non-storage hosts are strictly rejected to prevent SSRF.
 */

/**
 * Validates and sanitizes a logo URL for the PDF renderer.
 * Returns the URL if valid, or null if it fails security criteria.
 */
export function validateSupabaseLogoUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);

    // 1. Only allow HTTP/HTTPS
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }

    // 2. Reject credentials in URL
    if (parsed.username || parsed.password) {
      return null;
    }

    // 3. Path MUST point to public business-logos bucket
    const expectedPrefix = '/storage/v1/object/public/business-logos/';
    if (!parsed.pathname.startsWith(expectedPrefix)) {
      return null;
    }

    // Prevent directory traversal
    if (parsed.pathname.includes('..')) {
      return null;
    }

    // 4. Validate hostname against Supabase configuration
    const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (configuredSupabaseUrl) {
      try {
        const configured = new URL(configuredSupabaseUrl);
        if (parsed.hostname.toLowerCase() === configured.hostname.toLowerCase()) {
          return trimmed;
        }
      } catch {
        // Fallback to general validation if configured URL is unparseable
      }
    }

    // Allow *.supabase.co or localhost/127.0.0.1 for development
    const hostname = parsed.hostname.toLowerCase();
    const isSupabaseHost = hostname.endsWith('.supabase.co') || hostname === 'supabase.co';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isSupabaseHost || (process.env.NODE_ENV !== 'production' && isLocalhost)) {
      return trimmed;
    }

    return null;
  } catch {
    return null;
  }
}
