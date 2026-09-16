import { BadRequestException } from '@nestjs/common';

import { Locale, SectionType } from '../generated/prisma/enums.js';

type RawData = Record<string, unknown>;

/**
 * Per section type, the subset of `data` keys that hold display text (as
 * opposed to technical/shared fields like imageUrl, limit, buttonUrl). These
 * are the only keys ever read from/written to `data.translations.en` — the
 * base `data` fields double as the TR content, so no separate `tr` bucket is
 * needed and every pre-existing section is already valid TR content as-is.
 */
const TEXT_FIELDS: Record<SectionType, string[]> = {
  HERO: ['title', 'subtitle', 'ctaLabel'],
  TEXT: ['title', 'body'],
  IMAGE_TEXT: ['title', 'body'],
  SERVICES: ['title'],
  PROJECTS: ['title'],
  POSTS: ['title'],
  CTA: ['title', 'description', 'buttonLabel'],
};

function str(raw: RawData, key: string, required = false): string | undefined {
  const value = raw[key];

  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new BadRequestException(`data.${key} zorunludur.`);
    }
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new BadRequestException(`data.${key} bir metin olmalıdır.`);
  }

  return value;
}

function int(raw: RawData, key: string): number | undefined {
  const value = raw[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new BadRequestException(`data.${key} pozitif bir tam sayı olmalıdır.`);
  }

  return value;
}

function dropUndefined(obj: RawData): RawData {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

/**
 * `data` is a free-form Json column, so its shape is validated by hand per
 * section type here rather than via class-validator decorators — the result
 * is also sanitized down to only the known fields for that type.
 */
export function validateSectionData(type: SectionType, data: unknown): RawData {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new BadRequestException('data alanı bir JSON nesnesi olmalıdır.');
  }

  const raw = data as RawData;
  const base = validateBaseFields(type, raw);
  const translations = validateTranslations(type, raw);

  return translations ? { ...base, translations } : base;
}

/** Validates translated (EN) overrides for the text fields of a section type. All optional — an absent or blank field simply falls back to the TR base field. */
function validateTranslations(
  type: SectionType,
  raw: RawData,
): { en: RawData } | undefined {
  const translations = raw.translations;

  if (translations === undefined || translations === null) {
    return undefined;
  }

  if (typeof translations !== 'object' || Array.isArray(translations)) {
    throw new BadRequestException('data.translations bir JSON nesnesi olmalıdır.');
  }

  const en = (translations as RawData).en;

  if (en === undefined || en === null) {
    return undefined;
  }

  if (typeof en !== 'object' || Array.isArray(en)) {
    throw new BadRequestException('data.translations.en bir JSON nesnesi olmalıdır.');
  }

  const fields = TEXT_FIELDS[type] ?? [];
  const cleanedEn = dropUndefined(
    Object.fromEntries(fields.map((key) => [key, str(en as RawData, key)])),
  );

  return Object.keys(cleanedEn).length > 0 ? { en: cleanedEn } : undefined;
}

/** Resolves a section's `data` for public consumption at the given locale — TR reads the base fields as-is; EN overlays `data.translations.en` on top, field by field, falling back to the TR value wherever no EN override is set. */
export function resolveSectionLocale(
  type: SectionType,
  data: unknown,
  locale: Locale,
): RawData {
  const raw =
    typeof data === 'object' && data !== null && !Array.isArray(data)
      ? (data as RawData)
      : {};
  const { translations, ...base } = raw;

  if (locale !== 'en') {
    return base;
  }

  const en = (translations as { en?: RawData } | undefined)?.en;

  if (!en) {
    return base;
  }

  const merged = { ...base };
  for (const key of TEXT_FIELDS[type] ?? []) {
    const value = en[key];
    if (typeof value === 'string' && value.trim() !== '') {
      merged[key] = value;
    }
  }

  return merged;
}

function validateBaseFields(type: SectionType, raw: RawData): RawData {
  switch (type) {
    case SectionType.HERO:
      return dropUndefined({
        title: str(raw, 'title', true),
        subtitle: str(raw, 'subtitle'),
        imageUrl: str(raw, 'imageUrl'),
        ctaLabel: str(raw, 'ctaLabel'),
        ctaUrl: str(raw, 'ctaUrl'),
      });

    case SectionType.TEXT:
      return dropUndefined({
        title: str(raw, 'title'),
        body: str(raw, 'body', true),
      });

    case SectionType.IMAGE_TEXT: {
      const imagePosition = raw.imagePosition;
      if (
        imagePosition !== undefined &&
        imagePosition !== null &&
        imagePosition !== 'left' &&
        imagePosition !== 'right'
      ) {
        throw new BadRequestException('data.imagePosition yalnızca "left" veya "right" olabilir.');
      }

      return dropUndefined({
        title: str(raw, 'title'),
        body: str(raw, 'body', true),
        imageUrl: str(raw, 'imageUrl', true),
        imagePosition: (imagePosition as 'left' | 'right' | undefined) ?? undefined,
      });
    }

    case SectionType.SERVICES:
    case SectionType.PROJECTS:
    case SectionType.POSTS:
      return dropUndefined({
        title: str(raw, 'title'),
        limit: int(raw, 'limit'),
      });

    case SectionType.CTA:
      return dropUndefined({
        title: str(raw, 'title', true),
        description: str(raw, 'description'),
        buttonLabel: str(raw, 'buttonLabel', true),
        buttonUrl: str(raw, 'buttonUrl', true),
        imageUrl: str(raw, 'imageUrl'),
      });

    default:
      throw new BadRequestException('Geçersiz section type.');
  }
}
