import { BadRequestException } from '@nestjs/common';
import { Locale } from '../generated/prisma/enums.js';
import { localize } from '../translations/localize.js';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ServiceStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(locale: Locale = 'tr') {
    return this.prisma.service
      .findMany({
        include: { translations: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      })
      .then((rows) => rows.map((row) => localize(row, locale)));
  }

  async findOne(id: string, locale: Locale = 'tr') {
    const service = await this.prisma.service.findUnique({
      include: { translations: true },
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Hizmet bulunamadı.');
    }

    return localize(service, locale);
  }

  async create(dto: CreateServiceDto) {
    await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr');

    const status = dto.status ?? ServiceStatus.DRAFT;

    return this.prisma.service
      .create({
        include: { translations: true },
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
          icon: dto.icon,
          coverImage: dto.coverImage,
          status,
          sortOrder: dto.sortOrder ?? 0,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          publishedAt: status === ServiceStatus.PUBLISHED ? new Date() : null,
        },
      })
      .then((row) => localize(row, dto.locale ?? 'tr'));
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.findOne(id);

    if (dto.slug) {
      await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr', id);
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
      nextStatus === ServiceStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.service
      .update({
        include: { translations: true },
        where: { id },
        data: {
          translations: hasChanges
            ? {
                upsert: {
                  where: { serviceId_locale: { serviceId: id, locale } },
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
          icon: dto.icon,
          coverImage: dto.coverImage,
          status: dto.status,
          sortOrder: dto.sortOrder,
          seoTitle: locale === 'tr' ? dto.seoTitle : undefined,
          seoDescription: locale === 'tr' ? dto.seoDescription : undefined,
          publishedAt,
        },
      })
      .then((row) => localize(row, locale));
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.service.delete({
      where: { id },
    });
  }

  private async ensureSlugAvailable(
    slug: string,
    locale: Locale = 'tr',
    excludeId?: string,
  ) {
    const existing = await this.prisma.serviceTranslation.findUnique({
      where: { locale_slug: { locale, slug } },
    });
    if (existing && existing.serviceId !== excludeId)
      throw new ConflictException('Slug is already used in this locale.');
  }
}
