import { Injectable, NotFoundException } from '@nestjs/common';
import { imageSize } from 'image-size';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryMediaDto } from './dto/query-media.dto.js';
import { UpdateMediaDto } from './dto/update-media.dto.js';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from './media.constants.js';
import { deleteUploadedFile, saveUploadedFile } from './media-storage.js';

const MEDIA_INCLUDE = {
  uploadedBy: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryMediaDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);

    const where: Prisma.MediaWhereInput = {};

    if (query.type === 'image') {
      where.mimeType = { startsWith: 'image/' };
    } else if (query.type === 'document') {
      where.mimeType = { not: { startsWith: 'image/' } };
    }

    if (query.search) {
      where.OR = [
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { altText: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: MEDIA_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: MEDIA_INCLUDE,
    });

    if (!media) {
      throw new NotFoundException('Medya bulunamadı.');
    }

    return media;
  }

  async create(file: Express.Multer.File, uploadedById: string) {
    const saved = await saveUploadedFile(file.buffer, file.mimetype);

    let width: number | null = null;
    let height: number | null = null;

    if (file.mimetype.startsWith('image/')) {
      try {
        const dimensions = imageSize(file.buffer);
        width = dimensions.width ?? null;
        height = dimensions.height ?? null;
      } catch {
        width = null;
        height = null;
      }
    }

    const extension = saved.fileName.split('.').pop() ?? '';

    return this.prisma.media.create({
      data: {
        originalName: file.originalname,
        fileName: saved.fileName,
        mimeType: file.mimetype,
        extension,
        size: file.size,
        width,
        height,
        path: saved.relativePath,
        url: saved.url,
        uploadedById,
      },
      include: MEDIA_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateMediaDto) {
    await this.findOne(id);

    return this.prisma.media.update({
      where: { id },
      data: {
        title: dto.title,
        altText: dto.altText,
      },
      include: MEDIA_INCLUDE,
    });
  }

  async remove(id: string) {
    const media = await this.findOne(id);

    await this.prisma.media.delete({
      where: { id },
    });

    await deleteUploadedFile(media.path);
  }
}
