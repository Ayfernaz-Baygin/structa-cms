import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { ContentStatus } from '../generated/prisma/enums.js';
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

  findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });

    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }

    return post;
  }

  async create(dto: CreatePostDto, authorId: string) {
    await this.ensureSlugAvailable(dto.slug);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const status = dto.status ?? ContentStatus.DRAFT;

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
        authorId,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : null,
      },
      include: POST_INCLUDE,
    });
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.findOne(id);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.ensureSlugAvailable(dto.slug);
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
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

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.post.delete({
      where: { id },
    });
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
