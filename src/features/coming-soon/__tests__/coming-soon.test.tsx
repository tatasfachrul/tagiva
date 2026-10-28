import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ComingSoonPage } from '../page';
import { comingSoonMetadata } from '../metadata';

describe('ComingSoon Feature', () => {
  it('has valid metadata', () => {
    expect(comingSoonMetadata.title).toContain('Coming Soon');
    expect(comingSoonMetadata.description).toBeDefined();
  });

  it('renders value proposition, waitlist form, and highlights', () => {
    const html = renderToString(<ComingSoonPage />);

    expect(html).toContain('Modern Invoicing for Indonesian Freelancers');
    expect(html).toContain('Coming Soon');
    expect(html).toContain('Notify Me');
    expect(html).toContain('Compliant A4 Invoicing');
    expect(html).toContain('Atomic Numbering');
  });
});
