import { Injectable, NotFoundException } from '@nestjs/common';

import { MenuLocation, PageStatus, ContentStatus, ProjectStatus, ServiceStatus } from '../generated/prisma/enums.js';
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
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

const POST_INCLUDE = {
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

  getSettings() {
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
  }

  getMenus() {
    return this.prisma.menu.findMany({
      orderBy: { location: 'asc' },
      include: MENU_INCLUDE,
    });
  }

  async getMenuByLocation(location: string) {
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

    return menu;
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, status: PageStatus.PUBLISHED },
    });

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return page;
  }

  getServices(query: PublicListQueryDto) {
    return this.prisma.service.findMany({
      where: { status: ServiceStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: query.limit,
    });
  }

  async getServiceBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, status: ServiceStatus.PUBLISHED },
    });

    if (!service) {
      throw new NotFoundException('Hizmet bulunamadı.');
    }

    return service;
  }

  getProjects(query: PublicListQueryDto) {
    return this.prisma.project.findMany({
      where: { status: ProjectStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: query.limit,
      include: PROJECT_INCLUDE,
    });
  }

  async getProjectBySlug(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { slug, status: ProjectStatus.PUBLISHED },
      include: PROJECT_INCLUDE,
    });

    if (!project) {
      throw new NotFoundException('Proje bulunamadı.');
    }

    return project;
  }

  getPosts(query: PublicListQueryDto) {
    return this.prisma.post.findMany({
      where: { status: ContentStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      take: query.limit,
      include: POST_INCLUDE,
    });
  }

  async getPostBySlug(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: POST_INCLUDE,
    });

    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }

    return post;
  }
}
