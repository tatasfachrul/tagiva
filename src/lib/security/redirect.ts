/**
 * Tagiva - Open Redirect Prevention Helper
 *
 * Implements SEC-AUTH-4: ensures redirect URLs (e.g., ?next=...) are strictly
 * relative paths starting with a single '/' and never redirect to external domains.
 */

export function sanitizeRedirectPath(
  path: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (!path || typeof path !== 'string') {
    return fallback;
  }

  const trimmed = path.trim();

  // Must begin with a single slash, followed by a non-slash character
  // Disallows: '//evil.com', '/\evil.com', 'javascript:...', 'https://...', etc.
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Ensure there are no control characters or embedded schemes
  try {
    const dummyBase = 'https://tagiva.local';
    const parsed = new URL(trimmed, dummyBase);

    // Origin must remain strictly identical to dummyBase (ensures no domain override)
    if (parsed.origin !== dummyBase) {
      return fallback;
    }

    // Return pathname + search + hash
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
