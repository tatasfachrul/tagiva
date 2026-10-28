'use client';

/**
 * Tagiva - Authenticated App Header
 *
 * Implements:
 * - Tagiva brand lockup (D-60)
 * - Language switcher (EN | ID, D-47)
 * - Pro upgrade CTA button
 * - User profile menu & Sign-out (SEC-AUTH-1)
 */

import Link from 'next/link';
import { LogOut, Menu, Sparkles, User as UserIcon } from 'lucide-react';
import { TagivaLogo } from '@/components/layout/tagiva-logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/features/auth/actions';
import type { UserPlanState } from '@/lib/domain/entitlements';
import type { ProfileRow } from '@/types/database';

interface AppHeaderProps {
  userEmail?: string;
  profile?: ProfileRow | null;
  planState: UserPlanState;
  onMobileMenuToggle?: () => void;
}

export function AppHeader({
  userEmail,
  profile,
  planState,
  onMobileMenuToggle,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="lg:hidden text-slate-600 hover:text-slate-900"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="lg:hidden">
          <TagivaLogo size="sm" showWordmark={true} />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {planState !== 'pro' && (
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex bg-primary hover:bg-primary-hover text-white font-medium gap-1.5 shadow-xs h-9 px-3.5 text-xs"
          >
            <Link href="/settings/billing">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade to Pro</span>
            </Link>
          </Button>
        )}

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full p-1 pl-2 hover:bg-slate-100 text-slate-700"
            >
              <div className="h-7 w-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                {profile?.business_name ? profile.business_name[0]?.toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
              </div>
              <span className="hidden md:inline-block text-xs font-medium max-w-[120px] truncate text-slate-800">
                {profile?.business_name || userEmail || 'Account'}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 shadow-md">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {profile?.business_name || 'My Business'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {userEmail}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 w-fit">
                  {planState} plan
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer text-xs">
                Invoices
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/clients" className="cursor-pointer text-xs">
                Clients Directory
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-xs">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/billing" className="cursor-pointer text-xs">
                Subscription & Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOutAction()}
              className="cursor-pointer text-xs text-rose-600 focus:text-rose-700 focus:bg-rose-50"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
