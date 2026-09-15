"use client";

import { useRef, useState } from "react";

export type Locale = "tr" | "en";
export interface ContentTranslation {
  locale: Locale;
  title: string;
  slug: string;
  body?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  excerpt?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}
type Field = Exclude<keyof ContentTranslation, "locale">;
type Initial = {
  id: string;
  title: string;
  slug: string;
  translations?: ContentTranslation[];
};

export function useContentTranslations(
  initial: Initial | undefined,
  fields: Field[],
) {
  const [locale, setLocale] = useState<Locale>("tr");
  const [drafts, setDrafts] = useState<Record<Locale, Record<string, string>>>(
    () => {
      const read = (language: Locale) => {
        const source =
          initial?.translations?.find((t) => t.locale === language) ??
          (language === "tr" && !initial?.translations ? initial : undefined);
        return Object.fromEntries(
          fields.map((key) => [
            key,
            (source as unknown as Record<string, string> | undefined)?.[key] ??
              "",
          ]),
        );
      };
      return { tr: read("tr"), en: read("en") };
    },
  );
  const dirty = useRef(new Set<Locale>());
  const entityId = useRef(initial?.id);
  const [touched, setTouched] = useState<Record<Locale, boolean>>({
    tr: Boolean(
      initial?.translations?.find((t) => t.locale === "tr")?.slug ??
      initial?.slug,
    ),
    en: Boolean(initial?.translations?.find((t) => t.locale === "en")?.slug),
  });
  function field(key: Field): [string, (value: string) => void] {
    return [
      drafts[locale][key] ?? "",
      (value) => {
        dirty.current.add(locale);
        setDrafts((previous) => ({
          ...previous,
          [locale]: { ...previous[locale], [key]: value },
        }));
      },
    ];
  }
  async function save(url: string, options: RequestInit) {
    const other = locale === "tr" ? "en" : "tr";
    if (
      dirty.current.has(other) &&
      (!drafts[other].title || !drafts[other].slug)
    ) {
      return Response.json(
        { message: `${other.toUpperCase()}: title and slug are required.` },
        { status: 400 },
      );
    }
    const base = initial ? url.slice(0, url.lastIndexOf("/")) : url;
    const target = entityId.current ? `${base}/${entityId.current}` : url;
    const response = await fetch(target, {
      ...options,
      method: entityId.current ? "PATCH" : "POST",
    });
    if (!response.ok) return response;
    const saved = await response.clone().json();
    entityId.current = saved.id;
    dirty.current.delete(locale);
    if (dirty.current.has(other)) {
      const translated = await fetch(`${base}/${saved.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...drafts[other], locale: other }),
      });
      if (!translated.ok) return translated;
      dirty.current.delete(other);
    }
    return response;
  }
  return {
    locale,
    setLocale,
    field,
    save,
    slugState: [
      touched[locale],
      (value: boolean) =>
        setTouched((previous) => ({ ...previous, [locale]: value })),
    ] as const,
  };
}
