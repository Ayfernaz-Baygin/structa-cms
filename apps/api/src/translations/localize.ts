import { Locale } from '../generated/prisma/enums.js';

type Translation = {
  locale: Locale;
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

/** The translation row is authoritative; legacy columns are only compatibility mirrors. */
export function localize<T extends { translations: Translation[] }>(
  entity: T,
  locale: Locale = 'tr',
) {
  const translation =
    entity.translations.find((t) => t.locale === locale) ??
    entity.translations.find((t) => t.locale === 'tr');
  const {
    id: _id,
    pageId: _pageId,
    serviceId: _serviceId,
    projectId: _projectId,
    postId: _postId,
    ...fields
  } = (translation ?? {
    title: '',
    slug: '',
    body: null,
    description: null,
    shortDescription: null,
    excerpt: null,
    content: null,
    seoTitle: null,
    seoDescription: null,
  }) as Translation & Record<string, unknown>;
  return {
    ...entity,
    ...fields,
    locale,
    translationLocale: translation?.locale ?? null,
  };
}

export function translationWhere(locale: Locale, slug?: string) {
  return {
    OR: [
      {
        translations: {
          some: { locale, ...(slug === undefined ? {} : { slug }) },
        },
      },
      {
        AND: [
          { translations: { none: { locale } } },
          {
            translations: {
              some: {
                locale: Locale.tr,
                ...(slug === undefined ? {} : { slug }),
              },
            },
          },
        ],
      },
    ],
  };
}
