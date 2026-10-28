import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ForbiddenPage } from '../page';
import { forbiddenMetadata } from '../metadata';

describe('Forbidden Feature (403)', () => {
  it('has valid metadata', () => {
    expect(forbiddenMetadata.title).toContain('403');
    expect(forbiddenMetadata.description).toBeDefined();
  });

  it('renders 403 badge, access denied explanation, and sign-in action', () => {
    const html = renderToString(<ForbiddenPage />);

    expect(html).toContain('403');
    expect(html).toContain('Access Forbidden');
    expect(html).toContain('Akses ditolak');
    expect(html).toContain('Switch Account / Sign In');
    expect(html).toContain('support@tagiva.com');
  });
});
