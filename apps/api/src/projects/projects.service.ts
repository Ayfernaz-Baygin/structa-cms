import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { ProjectStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectImageDto } from './dto/create-project-image.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

const PROJECT_INCLUDE = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: PROJECT_INCLUDE,
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });

    if (!project) {
      throw new NotFoundException('Proje bulunamadı.');
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    await this.ensureSlugAvailable(dto.slug);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const status = dto.status ?? ProjectStatus.DRAFT;

    return this.prisma.project.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        clientName: dto.clientName,
        location: dto.location,
        projectDate: dto.projectDate ? new Date(dto.projectDate) : null,
        coverImage: dto.coverImage,
        status,
        sortOrder: dto.sortOrder ?? 0,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        categoryId: dto.categoryId ?? null,
        publishedAt: status === ProjectStatus.PUBLISHED ? new Date() : null,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.findOne(id);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.ensureSlugAvailable(dto.slug);
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const nextStatus = dto.status ?? existing.status;
    const publishedAt =
      nextStatus === ProjectStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        clientName: dto.clientName,
        location: dto.location,
        projectDate:
          dto.projectDate !== undefined
            ? dto.projectDate
              ? new Date(dto.projectDate)
              : null
            : undefined,
        coverImage: dto.coverImage,
        status: dto.status,
        sortOrder: dto.sortOrder,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        categoryId: dto.categoryId,
        publishedAt,
      },
      include: PROJECT_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.project.delete({
      where: { id },
    });
  }

  async addImage(projectId: string, dto: CreateProjectImageDto) {
    await this.findOne(projectId);

    await this.prisma.projectImage.create({
      data: {
        projectId,
        imageUrl: dto.imageUrl,
        altText: dto.altText,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return this.findOne(projectId);
  }

  async removeImage(projectId: string, imageId: string) {
    await this.findOne(projectId);

    const image = await this.prisma.projectImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.projectId !== projectId) {
      throw new NotFoundException('Galeri görseli bulunamadı.');
    }

    await this.prisma.projectImage.delete({
      where: { id: imageId },
    });

    return this.findOne(projectId);
  }

  private async ensureSlugAvailable(slug: string) {
    const existing = await this.prisma.project.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor.');
    }
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.projectCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı.');
    }
  }
}
