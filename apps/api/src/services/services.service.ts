import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { ServiceStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Hizmet bulunamadı.');
    }

    return service;
  }

  async create(dto: CreateServiceDto) {
    await this.ensureSlugAvailable(dto.slug);

    const status = dto.status ?? ServiceStatus.DRAFT;

    return this.prisma.service.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        icon: dto.icon,
        coverImage: dto.coverImage,
        status,
        sortOrder: dto.sortOrder ?? 0,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        publishedAt: status === ServiceStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.findOne(id);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.ensureSlugAvailable(dto.slug);
    }

    const nextStatus = dto.status ?? existing.status;
    const publishedAt =
      nextStatus === ServiceStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.service.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        icon: dto.icon,
        coverImage: dto.coverImage,
        status: dto.status,
        sortOrder: dto.sortOrder,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        publishedAt,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.service.delete({
      where: { id },
    });
  }

  private async ensureSlugAvailable(slug: string) {
    const existing = await this.prisma.service.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor.');
    }
  }
}
