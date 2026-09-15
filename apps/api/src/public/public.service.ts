import { Locale } from '../generated/prisma/enums.js';
import { localize, translationWhere } from '../translations/localize.js';
import { Injectable, NotFoundException } from '@nestjs/common';

import {
  MenuLocation,
  PageStatus,
  ContentStatus,
  ProjectStatus,
  ServiceStatus,
} from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublicListQueryDto } from './dto/public-list-query.dto.js';

const SETTINGS_ID = 'singleton';

const MENU_INCLUDE = {
  items: {
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' as const },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' as const },
      },
    },
  },
};

const PROJECT_INCLUDE = {
  translations: true,
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

const POST_INCLUDE = {
  translations: true,
  category: true,
  author: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
} as const;

const VALID_MENU_LOCATIONS: string[] = Object.values(MenuLocation);

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  getSettings(locale: Locale = 'tr') {
    return this.prisma.siteSettings
      .upsert({
        where: { id: SETTINGS_ID },
        update: {},
        create: { id: SETTINGS_ID },
        include: {
          homePage: { include: { translations: true } },
        },
      })
      .then((settings) => ({
        ...settings,
        homePage:
          settings.homePage && settings.homePage.status === 'PUBLISHED'
            ? (() => {
                const page = localize(settings.homePage, locale);
                return page.translationLocale ? { slug: page.slug } : null;
              })()
            : null,
      }));
  }

  getMenus(locale: Locale = 'tr') {
    return this.prisma.menu
      .findMany({
        orderBy: { location: 'asc' },
        include: MENU_INCLUDE,
      })
      .then((menus) =>
        Promise.all(menus.map((menu) => this.localizeMenu(menu, locale))),
      );
  }

  async getMenuByLocation(location: string, locale: Locale = 'tr') {
    if (!VALID_MENU_LOCATIONS.includes(location)) {
      throw new NotFoundException('Menü bulunamadı.');
    }

    const menu = await this.prisma.menu.findUnique({
      where: { location: location as MenuLocation },
      include: MENU_INCLUDE,
    });

    if (!menu) {
      throw new NotFoundException('Menü bulunamadı.');
    }

    return this.localizeMenu(menu, locale);
  }

  private async localizeMenu<
    T extends { items: { url: string; children: { url: string }[] }[] },
  >(menu: T, locale: Locale) {
    if (locale === 'tr') return menu;
    const localizeUrl = async (url: string) => {
      if (
        !url.startsWith('/') ||
        url.startsWith('//') ||
        /^\/(tr|en)(?:\/|$)/.test(url)
      )
        return url;
      const parsed = new URL(url, 'http://cms.local');
      const parts = parsed.pathname.split('/').filter(Boolean);
      const slug = parts.at(-1);
      if (!slug) return url;
      const where = { locale_slug: { locale: Locale.tr, slug } };
      let translatedSlug: string | undefined;
      if (
        parts.length === 1 &&
        !['services', 'projects', 'blog'].includes(slug)
      ) {
        const row = await this.prisma.pageTranslation.findUnique({
          where,
          include: { page: { include: { translations: true } } },
        });
        translatedSlug = row ? localize(row.page, locale).slug : undefined;
      } else if (parts.length === 2) {
        if (parts[0] === 'services') {
          const row = await this.prisma.serviceTranslation.findUnique({
            where,
            include: { service: { include: { translations: true } } },
          });
          translatedSlug = row ? localize(row.service, locale).slug : undefined;
        } else if (parts[0] === 'projects') {
          const row = await this.prisma.projectTranslation.findUnique({
            where,
            include: { project: { include: { translations: true } } },
          });
          translatedSlug = row ? localize(row.project, locale).slug : undefined;
        } else if (parts[0] === 'blog') {
          const row = await this.prisma.postTranslation.findUnique({
            where,
            include: { post: { include: { translations: true } } },
          });
          translatedSlug = row ? localize(row.post, locale).slug : undefined;
        }
      }
      if (!translatedSlug) return url;
      parts[parts.length - 1] = translatedSlug;
      return `/${parts.join('/')}${parsed.search}${parsed.hash}`;
    };
    return {
      ...menu,
      items: await Promise.all(
        menu.items.map(async (item) => ({
          ...item,
          url: await localizeUrl(item.url),
          children: await Promise.all(
            item.children.map(async (child) => ({
              ...child,
              url: await localizeUrl(child.url),
            })),
          ),
        })),
      ),
    };
  }

  async getPageBySlug(slug: string, locale: Locale = 'tr') {
    let page = await this.prisma.page.findFirst({
      where: {
        translations: { some: { locale, slug } },
        status: PageStatus.PUBLISHED,
      },
      include: {
        translations: true,
        sections: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!page)
      page = await this.prisma.page.findFirst({
        where: {
          ...translationWhere(locale, slug),
          status: PageStatus.PUBLISHED,
        },
        include: {
          translations: true,
          sections: { orderBy: { sortOrder: 'asc' } },
        },
      });

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return localize(page, locale);
  }

  getServices(query: PublicListQueryDto) {
    return this.prisma.service
      .findMany({
        include: { translations: true },
        where: {
          ...translationWhere(query.locale ?? 'tr'),
          status: ServiceStatus.PUBLISHED,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: query.limit,
      })
      .then((rows) => rows.map((row) => localize(row, query.locale ?? 'tr')));
  }

  async getServiceBySlug(slug: string, locale: Locale = 'tr') {
    let service = await this.prisma.service.findFirst({
      include: { translations: true },
      where: {
        translations: { some: { locale, slug } },
        status: ServiceStatus.PUBLISHED,
      },
    });
    if (!service)
      service = await this.prisma.service.findFirst({
        include: { translations: true },
        where: {
          ...translationWhere(locale, slug),
          status: ServiceStatus.PUBLISHED,
        },
      });

    if (!service) {
      throw new NotFoundException('Hizmet bulunamadı.');
    }

    return localize(service, locale);
  }

  getProjects(query: PublicListQueryDto) {
    return this.prisma.project
      .findMany({
        where: {
          ...translationWhere(query.locale ?? 'tr'),
          status: ProjectStatus.PUBLISHED,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: query.limit,
        include: PROJECT_INCLUDE,
      })
      .then((rows) => rows.map((row) => localize(row, query.locale ?? 'tr')));
  }

  async getProjectBySlug(slug: string, locale: Locale = 'tr') {
    let project = await this.prisma.project.findFirst({
      where: {
        translations: { some: { locale, slug } },
        status: ProjectStatus.PUBLISHED,
      },
      include: PROJECT_INCLUDE,
    });
    if (!project)
      project = await this.prisma.project.findFirst({
        where: {
          ...translationWhere(locale, slug),
          status: ProjectStatus.PUBLISHED,
        },
        include: PROJECT_INCLUDE,
      });

    if (!project) {
      throw new NotFoundException('Proje bulunamadı.');
    }

    return localize(project, locale);
  }

  getPosts(query: PublicListQueryDto) {
    return this.prisma.post
      .findMany({
        where: {
          ...translationWhere(query.locale ?? 'tr'),
          status: ContentStatus.PUBLISHED,
        },
        orderBy: { publishedAt: 'desc' },
        take: query.limit,
        include: POST_INCLUDE,
      })
      .then((rows) => rows.map((row) => localize(row, query.locale ?? 'tr')));
  }

  async getPostBySlug(slug: string, locale: Locale = 'tr') {
    let post = await this.prisma.post.findFirst({
      where: {
        translations: { some: { locale, slug } },
        status: ContentStatus.PUBLISHED,
      },
      include: POST_INCLUDE,
    });
    if (!post)
      post = await this.prisma.post.findFirst({
        where: {
          ...translationWhere(locale, slug),
          status: ContentStatus.PUBLISHED,
        },
        include: POST_INCLUDE,
      });

    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }

    return localize(post, locale);
  }
}
