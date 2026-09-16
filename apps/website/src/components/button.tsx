import type { ComponentProps, ReactNode } from 'react';

import Link from '@/components/locale-link';

type Variant = 'filled' | 'outline' | 'inverted' | 'outlineLight';

const VARIANT_CLASSES: Record<Variant, string> = {
  filled: 'bg-accent text-accent-foreground hover:bg-accent-strong',
  outline: 'border border-foreground/20 text-foreground hover:border-foreground/50',
  inverted: 'bg-white text-stone-900 hover:bg-white/90',
  outlineLight: 'border border-white/40 text-white hover:border-white hover:bg-white/10',
};

type ButtonProps = Omit<ComponentProps<typeof Link>, 'href' | 'className'> & {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

/** The one pill-CTA look used site-wide, so every button shares the same shape, weight, and transition. */
export function Button({ href, variant = 'filled', className = '', children, ...props }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition duration-300 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
