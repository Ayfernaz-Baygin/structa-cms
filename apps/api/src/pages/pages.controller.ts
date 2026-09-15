import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser, type CurrentUserPayload } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../generated/prisma/enums.js';
import { CreatePageSectionDto } from './dto/create-page-section.dto.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { ReorderPageSectionsDto } from './dto/reorder-page-sections.dto.js';
import { UpdatePageSectionDto } from './dto/update-page-section.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { PagesService } from './pages.service.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.pagesService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.pagesService.remove(id);
  }

  @Get(':pageId/sections')
  findSections(@Param('pageId') pageId: string) {
    return this.pagesService.findSections(pageId);
  }

  @Post(':pageId/sections')
  createSection(@Param('pageId') pageId: string, @Body() dto: CreatePageSectionDto) {
    return this.pagesService.createSection(pageId, dto);
  }

  @Patch(':pageId/sections/reorder')
  reorderSections(@Param('pageId') pageId: string, @Body() dto: ReorderPageSectionsDto) {
    return this.pagesService.reorderSections(pageId, dto);
  }

  @Patch(':pageId/sections/:sectionId')
  updateSection(
    @Param('pageId') pageId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdatePageSectionDto,
  ) {
    return this.pagesService.updateSection(pageId, sectionId, dto);
  }

  @Delete(':pageId/sections/:sectionId')
  removeSection(@Param('pageId') pageId: string, @Param('sectionId') sectionId: string) {
    return this.pagesService.removeSection(pageId, sectionId);
  }

  @Get(':id/revisions')
  findRevisions(@Param('id') id: string) {
    return this.pagesService.findRevisions(id);
  }

  @Get(':id/revisions/:revisionId')
  findRevision(@Param('id') id: string, @Param('revisionId') revisionId: string) {
    return this.pagesService.findRevision(id, revisionId);
  }

  @Post(':id/revisions/:revisionId/restore')
  restoreRevision(
    @Param('id') id: string,
    @Param('revisionId') revisionId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.pagesService.restoreRevision(id, revisionId, currentUser);
  }
}
