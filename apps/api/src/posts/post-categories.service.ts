import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostCategoryDto } from './dto/create-post-category.dto.js';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto.js';

@Injectable()
export class PostCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.postCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.postCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı.');
    }

    return category;
  }

  async create(dto: CreatePostCategoryDto) {
    await this.ensureSlugAvailable(dto.slug);

    return this.prisma.postCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });
  }

  async update(id: string, dto: UpdatePostCategoryDto) {
    const existing = await this.findOne(id);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.ensureSlugAvailable(dto.slug);
    }

    return this.prisma.postCategory.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.postCategory.delete({
      where: { id },
    });
  }

  private async ensureSlugAvailable(slug: string) {
    const existing = await this.prisma.postCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor.');
    }
  }
}
