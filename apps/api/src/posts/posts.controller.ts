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

import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserRole } from '../generated/prisma/enums.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostsService } from './posts.service.js';

@UseInterceptors(TranslationConflictInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: LocaleQueryDto,
  ) {
    return this.postsService.findAll(currentUser, query.locale);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() query: LocaleQueryDto,
  ) {
    return this.postsService.findOne(id, currentUser, query.locale);
  }

  @Post()
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.postsService.create(dto, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.postsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.postsService.remove(id, currentUser);
  }
}
