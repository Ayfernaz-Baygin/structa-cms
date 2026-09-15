import { BadRequestException } from '@nestjs/common';
import { Locale } from '../generated/prisma/enums.js';
import { localize } from '../translations/localize.js';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { CurrentUserPayload } from '../auth/current-user.decorator.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PageStatus, SectionType } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePageSectionDto } from './dto/create-page-section.dto.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { ReorderPageSectionsDto } from './dto/reorder-page-sections.dto.js';
import { UpdatePageSectionDto } from './dto/update-page-section.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { validateSectionData } from './page-section-data.validator.js';

const REVISION_CREATED_BY_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
} as const;

interface RevisionTranslationSnapshot {
  locale: Locale;
  title: string;
  slug: string;
  body: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

interface RevisionSectionSnapshot {
  type: SectionType;
  sortOrder: number;
  data: Prisma.InputJsonValue;
}

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(locale: Locale = 'tr') {
    return this.prisma.page
      .findMany({
        include: { translations: true },
        orderBy: { updatedAt: 'desc' },
      })
      .then((rows) => rows.map((row) => localize(row, locale)));
  }

  async findOne(id: string, locale: Locale = 'tr') {
    const page = await this.prisma.page.findUnique({
      include: { translations: true },
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Sayfa bulunamadı.');
    }

    return localize(page, locale);
  }

  async create(dto: CreatePageDto) {
    await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr');

    const status = dto.status ?? PageStatus.DRAFT;

    return this.prisma.page
      .create({
        include: { translations: true },
        data: {
          translations: {
            create: {
              locale: dto.locale ?? 'tr',
              title: dto.title,
              slug: dto.slug,
              body: dto.body,
              seoTitle: dto.seoTitle,
              seoDescription: dto.seoDescription,
            },
          },
          title: dto.title,
          slug: dto.slug,
          body: dto.body,
          status,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          publishedAt: status === PageStatus.PUBLISHED ? new Date() : null,
        },
      })
      .then((row) => localize(row, dto.locale ?? 'tr'));
  }

  async update(
    id: string,
    dto: UpdatePageDto,
    currentUser: CurrentUserPayload,
  ) {
    const existing = await this.findOne(id);

    if (dto.slug) {
      await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr', id);
    }

    const locale = dto.locale ?? 'tr';
    const source = existing.translations.find((t) => t.locale === locale);
    const hasChanges = [
      dto.title,
      dto.slug,
      dto.body,
      dto.seoTitle,
      dto.seoDescription,
    ].some((value) => value !== undefined);
    if (hasChanges && !source && (!dto.title || !dto.slug))
      throw new BadRequestException(
        'A new translation requires title and slug.',
      );
    const nextStatus = dto.status ?? existing.status;
    const publishedAt =
      nextStatus === PageStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.$transaction(async (tx) => {
      // Snapshot the pre-update state (page + current sections) before mutating it.
      await this.snapshotRevision(tx, existing, currentUser.sub);

      return tx.page
        .update({
          include: { translations: true },
          where: { id },
          data: {
            translations: hasChanges
              ? {
                  upsert: {
                    where: { pageId_locale: { pageId: id, locale } },
                    create: {
                      locale,
                      title: dto.title ?? source?.title ?? existing.title,
                      slug: dto.slug ?? source?.slug ?? existing.slug,
                      body: dto.body !== undefined ? dto.body : source?.body,
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
                      body: dto.body,
                      seoTitle: dto.seoTitle,
                      seoDescription: dto.seoDescription,
                    },
                  },
                }
              : undefined,
            title: locale === 'tr' ? dto.title : undefined,
            slug: locale === 'tr' ? dto.slug : undefined,
            body: locale === 'tr' ? dto.body : undefined,
            status: dto.status,
            seoTitle: locale === 'tr' ? dto.seoTitle : undefined,
            seoDescription: locale === 'tr' ? dto.seoDescription : undefined,
            publishedAt,
          },
        })
        .then((row) => localize(row, locale));
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.page.delete({
      where: { id },
    });
  }

  private async ensureSlugAvailable(
    slug: string,
    locale: Locale = 'tr',
    excludeId?: string,
  ) {
    const existing = await this.prisma.pageTranslation.findUnique({
      where: { locale_slug: { locale, slug } },
    });
    if (existing && existing.pageId !== excludeId)
      throw new ConflictException('Slug is already used in this locale.');
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

  async updateSection(
    pageId: string,
    sectionId: string,
    dto: UpdatePageSectionDto,
  ) {
    const section = await this.findSectionOrThrow(pageId, sectionId);

    const data = dto.data
      ? validateSectionData(section.type, dto.data)
      : undefined;

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

  async findRevisions(pageId: string) {
    await this.findOne(pageId);

    return this.prisma.pageRevision.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        seoTitle: true,
        seoDescription: true,
        createdAt: true,
        createdBy: { select: REVISION_CREATED_BY_SELECT },
      },
    });
  }

  async findRevision(pageId: string, revisionId: string) {
    await this.findOne(pageId);

    return this.findRevisionOrThrow(pageId, revisionId);
  }

  async restoreRevision(
    pageId: string,
    revisionId: string,
    currentUser: CurrentUserPayload,
  ) {
    const existing = await this.findOne(pageId);
    const revision = await this.findRevisionOrThrow(pageId, revisionId);

    const translations = revision.translations as unknown as
      RevisionTranslationSnapshot[] | null;
    const restoredTranslations = translations ?? [
      {
        locale: Locale.tr,
        title: revision.title,
        slug: revision.slug,
        body: revision.body,
        seoTitle: revision.seoTitle,
        seoDescription: revision.seoDescription,
      },
    ];
    for (const translation of restoredTranslations) {
      await this.ensureSlugAvailable(
        translation.slug,
        translation.locale,
        pageId,
      );
    }

    const publishedAt =
      revision.status === PageStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.$transaction(async (tx) => {
      // The state we're about to overwrite is itself saved first, so a
      // restore is never a one-way trip.
      await this.snapshotRevision(tx, existing, currentUser.sub);

      await tx.page.update({
        include: { translations: true },
        where: { id: pageId },
        data: {
          title: revision.title,
          slug: revision.slug,
          body: revision.body,
          status: revision.status,
          seoTitle: revision.seoTitle,
          seoDescription: revision.seoDescription,
          publishedAt,
        },
      });

      // Old revisions only restore TR; new snapshots restore the complete locale set.
      if (translations)
        await tx.pageTranslation.deleteMany({ where: { pageId } });
      for (const translation of restoredTranslations) {
        await tx.pageTranslation.upsert({
          where: { pageId_locale: { pageId, locale: translation.locale } },
          create: { pageId, ...translation },
          update: translation,
        });
      }
      await tx.pageSection.deleteMany({ where: { pageId } });

      const sectionsSnapshot =
        (revision.sections as unknown as RevisionSectionSnapshot[] | null) ??
        [];

      if (sectionsSnapshot.length > 0) {
        await tx.pageSection.createMany({
          data: sectionsSnapshot.map((section) => ({
            pageId,
            type: section.type,
            sortOrder: section.sortOrder,
            data: section.data,
          })),
        });
      }

      return tx.page.findUnique({
        where: { id: pageId },
        include: {
          translations: true,
          sections: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });
  }

  private async snapshotRevision(
    tx: Prisma.TransactionClient,
    page: {
      id: string;
      title: string;
      slug: string;
      body: string | null;
      status: PageStatus;
      seoTitle: string | null;
      seoDescription: string | null;
    },
    createdById: string,
  ) {
    const sections = await tx.pageSection.findMany({
      where: { pageId: page.id },
      orderBy: { sortOrder: 'asc' },
      select: { type: true, sortOrder: true, data: true },
    });

    const translations = await tx.pageTranslation.findMany({
      where: { pageId: page.id },
      select: {
        locale: true,
        title: true,
        slug: true,
        body: true,
        seoTitle: true,
        seoDescription: true,
      },
    });
    await tx.pageRevision.create({
      data: {
        pageId: page.id,
        title: page.title,
        slug: page.slug,
        body: page.body,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sections: sections as unknown as Prisma.InputJsonValue,
        translations: translations as unknown as Prisma.InputJsonValue,
        createdById,
      },
    });
  }

  private async findRevisionOrThrow(pageId: string, revisionId: string) {
    const revision = await this.prisma.pageRevision.findUnique({
      where: { id: revisionId },
      include: { createdBy: { select: REVISION_CREATED_BY_SELECT } },
    });

    if (!revision || revision.pageId !== pageId) {
      throw new NotFoundException('Sürüm bulunamadı.');
    }

    return revision;
  }
}
