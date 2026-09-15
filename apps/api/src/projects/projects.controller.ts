import { UseInterceptors } from '@nestjs/common';
import { TranslationConflictInterceptor } from '../translations/translation-conflict.interceptor.js';
import { Query } from '@nestjs/common';
import { LocaleQueryDto } from '../translations/locale.dto.js';
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

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../generated/prisma/enums.js';
import { CreateProjectImageDto } from './dto/create-project-image.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectsService } from './projects.service.js';

@UseInterceptors(TranslationConflictInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() query: LocaleQueryDto) {
    return this.projectsService.findAll(query.locale);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: LocaleQueryDto) {
    return this.projectsService.findOne(id, query.locale);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
  }

  @Post(':id/images')
  addImage(@Param('id') id: string, @Body() dto: CreateProjectImageDto) {
    return this.projectsService.addImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.projectsService.removeImage(id, imageId);
  }
}
