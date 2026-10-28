import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, min, inputMode, onKeyDown, onPaste, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Disallow negative signs ('-' or 'Subtract') when:
      // 1. type === 'number' and min is either undefined or >= 0 (all Tagiva number inputs are non-negative)
      // 2. inputMode === 'numeric'
      const isNonNegativeNumber =
        (type === 'number' && (min === undefined || Number(min) >= 0)) ||
        inputMode === 'numeric';

      if (isNonNegativeNumber) {
        if (e.key === '-' || e.key === 'Minus' || e.key === 'Subtract') {
          e.preventDefault();
          return;
        }
        if (type === 'number' && (e.key === 'e' || e.key === 'E')) {
          e.preventDefault();
          return;
        }
      }

      onKeyDown?.(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const isNonNegativeNumber =
        (type === 'number' && (min === undefined || Number(min) >= 0)) ||
        inputMode === 'numeric';

      if (isNonNegativeNumber) {
        const text = e.clipboardData.getData('text');
        if (text.includes('-')) {
          e.preventDefault();
          return;
        }
      }

      onPaste?.(e);
    };

    return (
      <input
        type={type}
        min={min}
        inputMode={inputMode}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          'flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 transition-colors',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
