import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Locale, PageStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { localizeSettings } from '../translations/localize.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

const SETTINGS_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(locale: Locale = Locale.tr) {
    const settings = await this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
      include: { translations: true },
    });

    return localizeSettings(settings, locale);
  }

  async update(dto: UpdateSettingsDto) {
    await this.findOrCreate();

    if (dto.homePageId) {
      await this.ensureHomePageExists(dto.homePageId);
    }

    const locale = dto.locale ?? Locale.tr;
    const { locale: _locale, siteName, siteDescription, footerText, address, ...technicalFields } = dto;
    const hasTranslatedChanges = [siteName, siteDescription, footerText, address].some(
      (value) => value !== undefined,
    );

    const settings = await this.prisma.siteSettings.update({
      where: { id: SETTINGS_ID },
      data: {
        ...technicalFields,
        translations: hasTranslatedChanges
          ? {
              upsert: {
                where: { siteSettingsId_locale: { siteSettingsId: SETTINGS_ID, locale } },
                create: { locale, siteName, siteDescription, footerText, address },
                update: { siteName, siteDescription, footerText, address },
              },
            }
          : undefined,
        siteName: locale === Locale.tr ? siteName : undefined,
        siteDescription: locale === Locale.tr ? siteDescription : undefined,
        footerText: locale === Locale.tr ? footerText : undefined,
        address: locale === Locale.tr ? address : undefined,
      },
      include: { translations: true },
    });

    return localizeSettings(settings, locale);
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
