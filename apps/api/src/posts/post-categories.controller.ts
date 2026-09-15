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
import { CreatePostCategoryDto } from './dto/create-post-category.dto.js';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto.js';
import { PostCategoriesService } from './post-categories.service.js';

@UseGuards(JwtAuthGuard)
@Controller('post-categories')
export class PostCategoriesController {
  constructor(private readonly postCategoriesService: PostCategoriesService) {}

  @Get()
  findAll() {
    return this.postCategoriesService.findAll();
  }

  @Post()
  create(@Body() dto: CreatePostCategoryDto) {
    return this.postCategoriesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostCategoryDto) {
    return this.postCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.postCategoriesService.remove(id);
  }
}
