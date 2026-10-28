'use client';

/**
 * Tagiva - Authenticated App Sidebar
 *
 * Implements:
 * - Desktop 240px sidebar (DESIGN_SYSTEM.md Section 5)
 * - Navigation links (Invoices, Clients, Settings, Billing)
 * - Free slot counter integration (D-12, D-21)
 * - Mobile responsive drawer overlay
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard,
  FileText,
  Plus,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { FreeSlotCounter } from '@/components/layout/free-slot-counter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UserPlanState } from '@/lib/domain/entitlements';

interface AppSidebarProps {
  planState: UserPlanState;
  invoiceCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/settings/billing', label: 'Subscription', icon: CreditCard },
];

export function AppSidebar({
  planState,
  invoiceCount,
  isOpenMobile = false,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200 p-4">
      {/* Top zone: Brand & Main Navigation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <TagivaLogo size="md" showWordmark={true} />
          {onCloseMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCloseMobile}
              className="lg:hidden text-slate-500 hover:text-slate-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Primary CTA: New Invoice */}
        <div className="px-1">
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium justify-center gap-2 shadow-xs h-10"
          >
            <Link href="/invoices/new" onClick={onCloseMobile}>
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </Link>
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard' || pathname.startsWith('/invoices')
                : item.href === '/settings'
                ? pathname === '/settings'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-primary font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-primary' : 'text-slate-500',
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom zone: Plan status / Free slot counter */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {planState !== 'pro' ? (
          <FreeSlotCounter usedCount={invoiceCount} maxSlots={3} />
        ) : (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-900">
            <div className="flex items-center justify-between font-semibold mb-1">
              <span>Pro Plan Active</span>
              <span className="text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.2">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-indigo-700 leading-snug">
              Unlimited invoices & custom logo enabled.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (240px) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-60 lg:flex-col">
        {navContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          {/* Mobile Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
