import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        // Semantic Tagiva Invoice Statuses (DESIGN_SYSTEM.md Section 3.3)
        draft: 'bg-[#F1F5F9] border-[#CBD5E1] text-[#334155]',
        sent: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
        paid: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]',
        overdue: 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]',
        warning: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
        pro: 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
