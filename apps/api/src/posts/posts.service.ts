import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import type { CurrentUserPayload } from '../auth/current-user.decorator.js';
import { ContentStatus, UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

const POST_INCLUDE = {
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

  findAll(currentUser: CurrentUserPayload) {
    // Authors only ever see their own posts, everyone else sees all of them.
    const where = currentUser.role === UserRole.AUTHOR ? { authorId: currentUser.sub } : {};

    return this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    });
  }

  async findOne(id: string, currentUser?: CurrentUserPayload) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });

    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }

    this.ensureOwnership(post, currentUser);

    return post;
  }

  async create(dto: CreatePostDto, currentUser: CurrentUserPayload) {
    await this.ensureSlugAvailable(dto.slug);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const status = dto.status ?? ContentStatus.DRAFT;
    this.ensureCanSetStatus(status, currentUser);

    return this.prisma.post.create({
      data: {
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
    });
  }

  async update(id: string, dto: UpdatePostDto, currentUser: CurrentUserPayload) {
    // findOne enforces that an AUTHOR can only touch their own post.
    const existing = await this.findOne(id, currentUser);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.ensureSlugAvailable(dto.slug);
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    if (dto.status) {
      this.ensureCanSetStatus(dto.status, currentUser);
    }

    const nextStatus = dto.status ?? existing.status;
    const publishedAt =
      nextStatus === ContentStatus.PUBLISHED && !existing.publishedAt
        ? new Date()
        : existing.publishedAt;

    return this.prisma.post.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        status: dto.status,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        categoryId: dto.categoryId,
        publishedAt,
      },
      include: POST_INCLUDE,
    });
  }

  async remove(id: string, currentUser: CurrentUserPayload) {
    await this.findOne(id, currentUser);

    await this.prisma.post.delete({
      where: { id },
    });
  }

  private ensureOwnership(post: { authorId: string }, currentUser?: CurrentUserPayload) {
    if (currentUser?.role === UserRole.AUTHOR && post.authorId !== currentUser.sub) {
      throw new ForbiddenException('Bu yazı üzerinde işlem yapma yetkiniz yok.');
    }
  }

  private ensureCanSetStatus(status: ContentStatus, currentUser: CurrentUserPayload) {
    if (currentUser.role === UserRole.AUTHOR && status === ContentStatus.PUBLISHED) {
      throw new ForbiddenException('Yazarlar içerik yayınlayamaz.');
    }
  }

  private async ensureSlugAvailable(slug: string) {
    const existing = await this.prisma.post.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor.');
    }
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
