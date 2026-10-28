import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ServerErrorPage } from '../page';
import { ErrorView } from '../components/error-view';
import { serverErrorMetadata } from '../metadata';

describe('ServerError Feature (500)', () => {
  it('has valid metadata', () => {
    expect(serverErrorMetadata.title).toContain('500');
    expect(serverErrorMetadata.description).toBeDefined();
  });

  it('renders 500 badge and friendly error notice', () => {
    const html = renderToString(<ServerErrorPage />);

    expect(html).toContain('500');
    expect(html).toContain('Internal Server Error');
    expect(html).toContain('Terjadi kesalahan pada sistem');
  });

  it('renders error digest code when available', () => {
    const mockError = Object.assign(new Error('Crash'), { digest: 'ERR_12345' });
    const html = renderToString(<ErrorView error={mockError} />);

    expect(html).toContain('ERR_12345');
    expect(html).not.toContain('Crash'); // Never leaks raw error message
  });
});
