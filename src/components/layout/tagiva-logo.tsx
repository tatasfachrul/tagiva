import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TagivaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  href?: string;
  priority?: boolean;
}

export function TagivaLogo({
  className,
  size = 'md',
  showWordmark = true,
  href = '/',
  priority = false,
}: TagivaLogoProps) {
  const pixelSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 32;

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <Image
        src="/logo.png"
        alt="Tagiva Logo"
        width={pixelSize}
        height={pixelSize}
        className="shrink-0 object-contain"
        priority={priority}
      />
      {showWordmark && (
        <span
          className={cn(
            'font-bold tracking-tight text-slate-900',
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg',
          )}
        >
          Tagiva
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
