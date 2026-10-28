import type { Metadata } from 'next';
import { getPublicInvoiceByToken } from './queries/public-invoice-queries';

/**
 * Tagiva - Public Invoice Metadata Generator
 *
 * Implements SEC-PUB-3 (Mandatory search engine exclusion: noindex, nofollow, noarchive).
 */
export async function generatePublicInvoiceMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const result = await getPublicInvoiceByToken(token);

  const title = result?.invoice?.invoiceNumber
    ? `Invoice ${result.invoice.invoiceNumber} | Tagiva`
    : 'Invoice | Tagiva';

  return {
    title,
    description: 'View and download invoice on Tagiva.',
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}
