import { Injectable } from '@nestjs/common';

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

    return this.prisma.siteSettings.update({
      where: { id: SETTINGS_ID },
      data: dto,
    });
  }
}
