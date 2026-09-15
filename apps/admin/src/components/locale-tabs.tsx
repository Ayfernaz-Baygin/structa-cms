"use client";
import type { Locale } from "@/lib/content-translations";
export function LocaleTabs({
  locale,
  onChange,
  disabled,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Content language"
    >
      {(["tr", "en"] as const).map((language) => (
        <button
          key={language}
          type="button"
          disabled={disabled}
          aria-pressed={locale === language}
          onClick={() => onChange(language)}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold ${locale === language ? "border-indigo-500 bg-indigo-500/20 text-indigo-300" : "border-zinc-700 text-zinc-400"}`}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
