import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NotFoundPage } from '../page';
import { notFoundMetadata } from '../metadata';

describe('NotFound Feature (404)', () => {
  it('has valid metadata', () => {
    expect(notFoundMetadata.title).toContain('404');
    expect(notFoundMetadata.description).toBeDefined();
  });

  it('renders 404 badge, friendly text, and return navigation links', () => {
    const html = renderToString(<NotFoundPage />);

    expect(html).toContain('404');
    expect(html).toContain('Page Not Found');
    expect(html).toContain('Halaman yang Anda tuju tidak ditemukan');
    expect(html).toContain('Go to Dashboard');
    expect(html).toContain('Return to Home');
  });
});
