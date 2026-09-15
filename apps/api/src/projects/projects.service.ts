import { BadRequestException } from '@nestjs/common';
import { Locale } from '../generated/prisma/enums.js';
import { localize } from '../translations/localize.js';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProjectStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectImageDto } from './dto/create-project-image.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

const PROJECT_INCLUDE = {
  translations: true,
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(locale: Locale = 'tr') {
    return this.prisma.project
      .findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: PROJECT_INCLUDE,
      })
      .then((rows) => rows.map((row) => localize(row, locale)));
  }

  async findOne(id: string, locale: Locale = 'tr') {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });

    if (!project) {
      throw new NotFoundException('Proje bulunamadı.');
    }

    return localize(project, locale);
  }

  async create(dto: CreateProjectDto) {
    await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr');

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const status = dto.status ?? ProjectStatus.DRAFT;

    return this.prisma.project
      .create({
        data: {
          translations: {
            create: {
              locale: dto.locale ?? 'tr',
              title: dto.title,
              slug: dto.slug,
              shortDescription: dto.shortDescription,
              description: dto.description,
              seoTitle: dto.seoTitle,
              seoDescription: dto.seoDescription,
            },
          },
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
      })
      .then((row) => localize(row, dto.locale ?? 'tr'));
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.findOne(id);

    if (dto.slug) {
      await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr', id);
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const locale = dto.locale ?? 'tr';
    const source = existing.translations.find((t) => t.locale === locale);
    const hasChanges = [
      dto.title,
      dto.slug,
      dto.shortDescription,
      dto.description,
      dto.seoTitle,
      dto.seoDescription,
    ].some((value) => value !== undefined);
    if (hasChanges && !source && (!dto.title || !dto.slug))
      throw new BadRequestException(
        'A new translation requires title and slug.',
      );
    const nextStatus = dto.status ?? existing.status;
    const publishedAt =
      nextStatus === ProjectStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.project
      .update({
        where: { id },
        data: {
          translations: hasChanges
            ? {
                upsert: {
                  where: { projectId_locale: { projectId: id, locale } },
                  create: {
                    locale,
                    title: dto.title ?? source?.title ?? existing.title,
                    slug: dto.slug ?? source?.slug ?? existing.slug,
                    shortDescription:
                      dto.shortDescription !== undefined
                        ? dto.shortDescription
                        : source?.shortDescription,
                    description:
                      dto.description !== undefined
                        ? dto.description
                        : source?.description,
                    seoTitle:
                      dto.seoTitle !== undefined
                        ? dto.seoTitle
                        : source?.seoTitle,
                    seoDescription:
                      dto.seoDescription !== undefined
                        ? dto.seoDescription
                        : source?.seoDescription,
                  },
                  update: {
                    title: dto.title,
                    slug: dto.slug,
                    shortDescription: dto.shortDescription,
                    description: dto.description,
                    seoTitle: dto.seoTitle,
                    seoDescription: dto.seoDescription,
                  },
                },
              }
            : undefined,
          title: locale === 'tr' ? dto.title : undefined,
          slug: locale === 'tr' ? dto.slug : undefined,
          shortDescription: locale === 'tr' ? dto.shortDescription : undefined,
          description: locale === 'tr' ? dto.description : undefined,
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
          seoTitle: locale === 'tr' ? dto.seoTitle : undefined,
          seoDescription: locale === 'tr' ? dto.seoDescription : undefined,
          categoryId: dto.categoryId,
          publishedAt,
        },
        include: PROJECT_INCLUDE,
      })
      .then((row) => localize(row, locale));
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

  private async ensureSlugAvailable(
    slug: string,
    locale: Locale = 'tr',
    excludeId?: string,
  ) {
    const existing = await this.prisma.projectTranslation.findUnique({
      where: { locale_slug: { locale, slug } },
    });
    if (existing && existing.projectId !== excludeId)
      throw new ConflictException('Slug is already used in this locale.');
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
