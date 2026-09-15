import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Locale, MenuItemTarget } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMenuItemDto } from './dto/create-menu-item.dto.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { ReorderMenuItemsDto } from './dto/reorder-menu-items.dto.js';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto.js';
import { UpdateMenuDto } from './dto/update-menu.dto.js';

const MENU_INCLUDE = {
  items: {
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' as const },
    include: {
      translations: true,
      children: {
        orderBy: { sortOrder: 'asc' as const },
        include: { translations: true },
      },
    },
  },
};

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.menu.findMany({
      orderBy: { location: 'asc' },
      include: MENU_INCLUDE,
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: MENU_INCLUDE,
    });

    if (!menu) {
      throw new NotFoundException('Menü bulunamadı.');
    }

    return menu;
  }

  async create(dto: CreateMenuDto) {
    await this.ensureLocationAvailable(dto.location);

    return this.prisma.menu.create({
      data: {
        name: dto.name,
        location: dto.location,
      },
      include: MENU_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateMenuDto) {
    const existing = await this.findOne(id);

    if (dto.location && dto.location !== existing.location) {
      await this.ensureLocationAvailable(dto.location);
    }

    return this.prisma.menu.update({
      where: { id },
      data: {
        name: dto.name,
        location: dto.location,
      },
      include: MENU_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.menu.delete({
      where: { id },
    });
  }

  async addItem(menuId: string, dto: CreateMenuItemDto) {
    await this.findOne(menuId);

    if (dto.parentId) {
      await this.ensureValidParent(menuId, dto.parentId);
    }

    const locale = dto.locale ?? Locale.tr;

    await this.prisma.menuItem.create({
      data: {
        menuId,
        label: dto.label,
        url: dto.url,
        target: dto.target ?? MenuItemTarget.SELF,
        sortOrder: dto.sortOrder ?? 0,
        parentId: dto.parentId ?? null,
        translations: {
          create: { locale, label: dto.label },
        },
      },
    });

    return this.findOne(menuId);
  }

  async updateItem(menuId: string, itemId: string, dto: UpdateMenuItemDto) {
    const item = await this.findItemOrThrow(menuId, itemId);

    if (dto.parentId) {
      if (dto.parentId === itemId) {
        throw new BadRequestException('Bir öğe kendi üst öğesi olamaz.');
      }

      const childCount = await this.prisma.menuItem.count({ where: { parentId: itemId } });
      if (childCount > 0) {
        throw new BadRequestException(
          'Alt öğeleri olan bir menü öğesi başka bir öğenin altına taşınamaz.',
        );
      }

      await this.ensureValidParent(menuId, dto.parentId);
    }

    const locale = dto.locale ?? Locale.tr;
    const source = await this.prisma.menuItemTranslation.findUnique({
      where: { menuItemId_locale: { menuItemId: itemId, locale } },
    });

    if (dto.label !== undefined && !source && !dto.label) {
      throw new BadRequestException('A new translation requires a label.');
    }

    await this.prisma.menuItem.update({
      where: { id: item.id },
      data: {
        label: locale === Locale.tr ? dto.label : undefined,
        url: dto.url,
        target: dto.target,
        sortOrder: dto.sortOrder,
        parentId: dto.parentId,
        translations:
          dto.label !== undefined
            ? {
                upsert: {
                  where: { menuItemId_locale: { menuItemId: itemId, locale } },
                  create: { locale, label: dto.label },
                  update: { label: dto.label },
                },
              }
            : undefined,
      },
    });

    return this.findOne(menuId);
  }

  async removeItem(menuId: string, itemId: string) {
    await this.findItemOrThrow(menuId, itemId);

    await this.prisma.menuItem.delete({
      where: { id: itemId },
    });
  }

  async reorder(menuId: string, dto: ReorderMenuItemsDto) {
    await this.findOne(menuId);

    const ids = dto.items.map((item) => item.id);
    const existingItems = await this.prisma.menuItem.findMany({
      where: { id: { in: ids }, menuId },
      select: { id: true },
    });

    if (existingItems.length !== ids.length) {
      throw new BadRequestException('Geçersiz menü öğesi bulundu.');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.menuItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return this.findOne(menuId);
  }

  private async ensureLocationAvailable(location: CreateMenuDto['location']) {
    const existing = await this.prisma.menu.findUnique({ where: { location } });

    if (existing) {
      throw new ConflictException(`${location} için zaten bir menü mevcut.`);
    }
  }

  private async ensureValidParent(menuId: string, parentId: string) {
    const parent = await this.prisma.menuItem.findUnique({ where: { id: parentId } });

    if (!parent) {
      throw new NotFoundException('Üst menü öğesi bulunamadı.');
    }

    if (parent.menuId !== menuId) {
      throw new BadRequestException('Üst menü öğesi farklı bir menüye ait olamaz.');
    }

    if (parent.parentId) {
      throw new BadRequestException('En fazla 2 seviye menü desteklenmektedir.');
    }
  }

  private async findItemOrThrow(menuId: string, itemId: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id: itemId } });

    if (!item || item.menuId !== menuId) {
      throw new NotFoundException('Menü öğesi bulunamadı.');
    }

    return item;
  }
}
