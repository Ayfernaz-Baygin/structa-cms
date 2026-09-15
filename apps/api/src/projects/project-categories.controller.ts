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
import { CreateProjectCategoryDto } from './dto/create-project-category.dto.js';
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto.js';
import { ProjectCategoriesService } from './project-categories.service.js';

@UseGuards(JwtAuthGuard)
@Controller('project-categories')
export class ProjectCategoriesController {
  constructor(private readonly projectCategoriesService: ProjectCategoriesService) {}

  @Get()
  findAll() {
    return this.projectCategoriesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateProjectCategoryDto) {
    return this.projectCategoriesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectCategoryDto) {
    return this.projectCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.projectCategoriesService.remove(id);
  }
}
