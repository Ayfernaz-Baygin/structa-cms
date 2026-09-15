import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PageStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

const SETTINGS_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findOrCreate() {
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    });
  }

  async update(dto: UpdateSettingsDto) {
    await this.findOrCreate();

    if (dto.homePageId) {
      await this.ensureHomePageExists(dto.homePageId);
    }

    return this.prisma.siteSettings.update({
      where: { id: SETTINGS_ID },
      data: dto,
    });
  }

  private async ensureHomePageExists(pageId: string) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });

    if (!page) {
      throw new NotFoundException('Seçilen sayfa bulunamadı.');
    }

    if (page.status !== PageStatus.PUBLISHED) {
      throw new BadRequestException('Ana sayfa olarak yalnızca yayında (PUBLISHED) bir sayfa seçilebilir.');
    }
  }
}
