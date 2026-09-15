import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import type { Prisma } from '../generated/prisma/client.js';
import { PageStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePageSectionDto } from './dto/create-page-section.dto.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { ReorderPageSectionsDto } from './dto/reorder-page-sections.dto.js';
import { UpdatePageSectionDto } from './dto/update-page-section.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { validateSectionData } from './page-section-data.validator.js';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return page;
  }

  async create(dto: CreatePageDto) {
    await this.ensureSlugAvailable(dto.slug);

    const status = dto.status ?? PageStatus.DRAFT;

    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        body: dto.body,
        status,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        publishedAt: status === PageStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdatePageDto) {
    const existing = await this.findOne(id);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.ensureSlugAvailable(dto.slug);
    }

    const nextStatus = dto.status ?? existing.status;
    const publishedAt =
      nextStatus === PageStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.page.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        body: dto.body,
        status: dto.status,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        publishedAt,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.page.delete({
      where: { id },
    });
  }

  private async ensureSlugAvailable(slug: string) {
    const existing = await this.prisma.page.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor.');
    }
  }

  findSections(pageId: string) {
    return this.prisma.pageSection.findMany({
      where: { pageId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createSection(pageId: string, dto: CreatePageSectionDto) {
    await this.findOne(pageId);

    const data = validateSectionData(dto.type, dto.data);

    await this.prisma.pageSection.create({
      data: {
        pageId,
        type: dto.type,
        data: data as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return this.findSections(pageId);
  }

  async updateSection(pageId: string, sectionId: string, dto: UpdatePageSectionDto) {
    const section = await this.findSectionOrThrow(pageId, sectionId);

    const data = dto.data ? validateSectionData(section.type, dto.data) : undefined;

    await this.prisma.pageSection.update({
      where: { id: section.id },
      data: {
        data: data as Prisma.InputJsonValue | undefined,
        sortOrder: dto.sortOrder,
      },
    });

    return this.findSections(pageId);
  }

  async removeSection(pageId: string, sectionId: string) {
    await this.findSectionOrThrow(pageId, sectionId);

    await this.prisma.pageSection.delete({
      where: { id: sectionId },
    });

    return this.findSections(pageId);
  }

  async reorderSections(pageId: string, dto: ReorderPageSectionsDto) {
    await this.findOne(pageId);

    const ids = dto.items.map((item) => item.id);
    const existingSections = await this.prisma.pageSection.findMany({
      where: { id: { in: ids }, pageId },
      select: { id: true },
    });

    if (existingSections.length !== ids.length) {
      throw new NotFoundException('Geçersiz sayfa bölümü bulundu.');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.pageSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return this.findSections(pageId);
  }

  private async findSectionOrThrow(pageId: string, sectionId: string) {
    const section = await this.prisma.pageSection.findUnique({
      where: { id: sectionId },
    });

    if (!section || section.pageId !== pageId) {
      throw new NotFoundException('Sayfa bölümü bulunamadı.');
    }

    return section;
  }
}
