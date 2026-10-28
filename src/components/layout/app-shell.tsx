'use client';

/**
 * Tagiva - Authenticated App Shell Wrapper
 *
 * Coordinates header, sidebar, responsive drawer, banners, and main viewport.
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SubscriptionBanners } from '@/components/layout/subscription-banners';
import type { UserPlanState } from '@/lib/domain/entitlements';
import type { ProfileRow } from '@/types/database';

interface AppShellProps {
  userEmail?: string;
  profile: ProfileRow | null;
  planState: UserPlanState;
  invoiceCount: number;
  daysRemaining?: number | null;
  children: React.ReactNode;
}

export function AppShell({
  userEmail,
  profile,
  planState,
  invoiceCount,
  daysRemaining,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If currently in onboarding, render standalone focused screen (D-38)
  if (pathname === '/onboarding') {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-md"
      >
        Skip to main content
      </a>

      {/* Expiry / Lapsed banners at the very top */}
      <SubscriptionBanners
        planState={planState}
        daysRemaining={daysRemaining}
      />

      {/* Main Layout Grid */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <AppSidebar
          planState={planState}
          invoiceCount={invoiceCount}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Content Area — marked inert when mobile navigation drawer is open */}
        <div
          className="flex flex-1 flex-col lg:pl-60"
          inert={mobileMenuOpen || undefined}
        >
          <AppHeader
            userEmail={userEmail}
            profile={profile}
            planState={planState}
            isMobileMenuOpen={mobileMenuOpen}
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
          />

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
