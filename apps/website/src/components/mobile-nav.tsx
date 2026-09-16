"use client";

import Link from "@/components/locale-link";
import { useState } from "react";
import { createPortal } from "react-dom";

import type { Menu } from "@/lib/api";

export function MobileNav({
  items,
  floating = false,
}: {
  items: Menu["items"];
  floating?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
          floating
            ? "border border-white/25 bg-white/10 text-white backdrop-blur-lg hover:bg-white/20"
            : "text-foreground hover:bg-black/4"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-6 w-6"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open &&
        // Portalled to <body> — the header's backdrop-blur establishes a new
        // containing block for `position: fixed` descendants, which would
        // otherwise clip this overlay to the header's own height.
        createPortal(
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface p-7 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-(family-name:--font-display) text-xl font-semibold text-foreground">
                  Menü
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Menüyü kapat"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-black/4"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="h-5 w-5"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <nav className="mt-10 flex flex-col gap-1 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="border-b border-border py-1 first:pt-0">
                    <Link
                      href={item.url}
                      target={item.target === "BLANK" ? "_blank" : undefined}
                      rel={
                        item.target === "BLANK"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      onClick={() => setOpen(false)}
                      className="block py-3 text-lg font-medium tracking-tight text-foreground transition hover:text-accent"
                    >
                      {item.label}
                    </Link>
                    {item.children.length > 0 && (
                      <div className="mb-3 flex flex-col gap-1 pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            target={
                              child.target === "BLANK" ? "_blank" : undefined
                            }
                            rel={
                              child.target === "BLANK"
                                ? "noopener noreferrer"
                                : undefined
                            }
                            onClick={() => setOpen(false)}
                            className="rounded-lg py-1.5 text-sm text-muted transition hover:text-foreground"
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
          </div>,
          document.body,
        )}
    </>
  );
}
