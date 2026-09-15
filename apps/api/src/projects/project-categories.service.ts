import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectCategoryDto } from './dto/create-project-category.dto.js';
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto.js';

@Injectable()
export class ProjectCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.projectCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.projectCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı.');
    }

    return category;
  }

  async create(dto: CreateProjectCategoryDto) {
    await this.ensureSlugAvailable(dto.slug);

    return this.prisma.projectCategory.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });
  }

  async update(id: string, dto: UpdateProjectCategoryDto) {
    const existing = await this.findOne(id);

    if (dto.slug && dto.slug !== existing.slug) {
      await this.ensureSlugAvailable(dto.slug);
    }

    return this.prisma.projectCategory.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.projectCategory.delete({
      where: { id },
    });
  }

  private async ensureSlugAvailable(slug: string) {
    const existing = await this.prisma.projectCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Bu slug zaten kullanılıyor.');
    }
  }
}
