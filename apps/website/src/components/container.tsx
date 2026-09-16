import type { ReactNode } from 'react';

const WIDTH = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
} as const;

export function Container({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof WIDTH;
}) {
  return (
    <div className={`mx-auto ${WIDTH[size]} px-4 sm:px-6 lg:px-8 ${className ?? ''}`}>{children}</div>
  );
}
