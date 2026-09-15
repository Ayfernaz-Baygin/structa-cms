import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PageStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';

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
}
