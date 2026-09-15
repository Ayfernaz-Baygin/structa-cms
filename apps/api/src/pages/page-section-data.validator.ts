import { BadRequestException } from '@nestjs/common';

import { SectionType } from '../generated/prisma/enums.js';

type RawData = Record<string, unknown>;

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
