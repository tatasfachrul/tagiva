import { redirect } from 'next/navigation';

/**
 * Pre-production redirect:
 * Redirects visitors from the login page to the Coming Soon page.
 * Revert to re-exporting LoginPage & loginMetadata from '@/features/auth' when ready for production.
 */
export default function LoginPage() {
  redirect('/coming-soon');
}
