import { BadRequestException } from '@nestjs/common';
import { Locale } from '../generated/prisma/enums.js';
import { localize } from '../translations/localize.js';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { CurrentUserPayload } from '../auth/current-user.decorator.js';
import { ContentStatus, UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

const POST_INCLUDE = {
  translations: true,
  category: true,
  author: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(currentUser: CurrentUserPayload, locale: Locale = 'tr') {
    // Authors only ever see their own posts, everyone else sees all of them.
    const where =
      currentUser.role === UserRole.AUTHOR ? { authorId: currentUser.sub } : {};

    return this.prisma.post
      .findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: POST_INCLUDE,
      })
      .then((rows) => rows.map((row) => localize(row, locale)));
  }

  async findOne(
    id: string,
    currentUser?: CurrentUserPayload,
    locale: Locale = 'tr',
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });

    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }

    this.ensureOwnership(post, currentUser);

    return localize(post, locale);
  }

  async create(dto: CreatePostDto, currentUser: CurrentUserPayload) {
    await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr');

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const status = dto.status ?? ContentStatus.DRAFT;
    this.ensureCanSetStatus(status, currentUser);

    return this.prisma.post
      .create({
        data: {
          translations: {
            create: {
              locale: dto.locale ?? 'tr',
              title: dto.title,
              slug: dto.slug,
              excerpt: dto.excerpt,
              content: dto.content,
              seoTitle: dto.seoTitle,
              seoDescription: dto.seoDescription,
            },
          },
          title: dto.title,
          slug: dto.slug,
          excerpt: dto.excerpt,
          content: dto.content,
          coverImage: dto.coverImage,
          status,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          categoryId: dto.categoryId ?? null,
          authorId: currentUser.sub,
          publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
        },
        include: POST_INCLUDE,
      })
      .then((row) => localize(row, dto.locale ?? 'tr'));
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    currentUser: CurrentUserPayload,
  ) {
    // findOne enforces that an AUTHOR can only touch their own post.
    const existing = await this.findOne(id, currentUser);

    if (dto.slug) {
      await this.ensureSlugAvailable(dto.slug, dto.locale ?? 'tr', id);
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    if (dto.status) {
      this.ensureCanSetStatus(dto.status, currentUser);
    }

    const locale = dto.locale ?? 'tr';
    const source = existing.translations.find((t) => t.locale === locale);
    const hasChanges = [
      dto.title,
      dto.slug,
      dto.excerpt,
      dto.content,
      dto.seoTitle,
      dto.seoDescription,
    ].some((value) => value !== undefined);
    if (hasChanges && !source && (!dto.title || !dto.slug))
      throw new BadRequestException(
        'A new translation requires title and slug.',
      );
    const nextStatus = dto.status ?? existing.status;
    const publishedAt =
      nextStatus === ContentStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.post
      .update({
        where: { id },
        data: {
          translations: hasChanges
            ? {
                upsert: {
                  where: { postId_locale: { postId: id, locale } },
                  create: {
                    locale,
                    title: dto.title ?? source?.title ?? existing.title,
                    slug: dto.slug ?? source?.slug ?? existing.slug,
                    excerpt:
                      dto.excerpt !== undefined ? dto.excerpt : source?.excerpt,
                    content:
                      dto.content !== undefined ? dto.content : source?.content,
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
                    excerpt: dto.excerpt,
                    content: dto.content,
                    seoTitle: dto.seoTitle,
                    seoDescription: dto.seoDescription,
                  },
                },
              }
            : undefined,
          title: locale === 'tr' ? dto.title : undefined,
          slug: locale === 'tr' ? dto.slug : undefined,
          excerpt: locale === 'tr' ? dto.excerpt : undefined,
          content: locale === 'tr' ? dto.content : undefined,
          coverImage: dto.coverImage,
          status: dto.status,
          seoTitle: locale === 'tr' ? dto.seoTitle : undefined,
          seoDescription: locale === 'tr' ? dto.seoDescription : undefined,
          categoryId: dto.categoryId,
          publishedAt,
        },
        include: POST_INCLUDE,
      })
      .then((row) => localize(row, locale));
  }

  async remove(id: string, currentUser: CurrentUserPayload) {
    await this.findOne(id, currentUser);

    await this.prisma.post.delete({
      where: { id },
    });
  }

  private ensureOwnership(
    post: { authorId: string },
    currentUser?: CurrentUserPayload,
  ) {
    if (
      currentUser?.role === UserRole.AUTHOR &&
      post.authorId !== currentUser.sub
    ) {
      throw new ForbiddenException(
        'Bu yazı üzerinde işlem yapma yetkiniz yok.',
      );
    }
  }

  private ensureCanSetStatus(
    status: ContentStatus,
    currentUser: CurrentUserPayload,
  ) {
    if (
      currentUser.role === UserRole.AUTHOR &&
      status === ContentStatus.PUBLISHED
    ) {
      throw new ForbiddenException('Yazarlar içerik yayınlayamaz.');
    }
  }

  private async ensureSlugAvailable(
    slug: string,
    locale: Locale = 'tr',
    excludeId?: string,
  ) {
    const existing = await this.prisma.postTranslation.findUnique({
      where: { locale_slug: { locale, slug } },
    });
    if (existing && existing.postId !== excludeId)
      throw new ConflictException('Slug is already used in this locale.');
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.postCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı.');
    }
  }
}
