'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { Menu } from '@/lib/api';

export function MobileNav({ items }: { items: Menu['items'] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition hover:bg-black/[.04]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-(family-name:--font-display) text-lg font-semibold">Menü</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menüyü kapat"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 transition hover:bg-black/[.04]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.url}
                    target={item.target === 'BLANK' ? '_blank' : undefined}
                    rel={item.target === 'BLANK' ? 'noopener noreferrer' : undefined}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition hover:bg-black/[.04]"
                  >
                    {item.label}
                  </Link>
                  {item.children.length > 0 && (
                    <div className="ml-3 flex flex-col border-l border-border pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          target={child.target === 'BLANK' ? '_blank' : undefined}
                          rel={child.target === 'BLANK' ? 'noopener noreferrer' : undefined}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-foreground/70 transition hover:bg-black/[.04]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
