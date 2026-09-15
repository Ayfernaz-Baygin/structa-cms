import { LocaleQueryDto } from '../translations/locale.dto.js';
import { Controller, Get, Param, Query } from '@nestjs/common';

import { PublicListQueryDto } from './dto/public-list-query.dto.js';
import { PublicService } from './public.service.js';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('settings')
  getSettings(@Query() query: LocaleQueryDto) {
    return this.publicService.getSettings(query.locale);
  }

  @Get('menus')
  getMenus(@Query() query: LocaleQueryDto) {
    return this.publicService.getMenus(query.locale);
  }

  @Get('menus/:location')
  getMenuByLocation(
    @Param('location') location: string,
    @Query() query: LocaleQueryDto,
  ) {
    return this.publicService.getMenuByLocation(location, query.locale);
  }

  @Get('pages/:slug')
  getPageBySlug(@Param('slug') slug: string, @Query() query: LocaleQueryDto) {
    return this.publicService.getPageBySlug(slug, query.locale);
  }

  @Get('services')
  getServices(@Query() query: PublicListQueryDto) {
    return this.publicService.getServices(query);
  }

  @Get('services/:slug')
  getServiceBySlug(
    @Param('slug') slug: string,
    @Query() query: LocaleQueryDto,
  ) {
    return this.publicService.getServiceBySlug(slug, query.locale);
  }

  @Get('projects')
  getProjects(@Query() query: PublicListQueryDto) {
    return this.publicService.getProjects(query);
  }

  @Get('projects/:slug')
  getProjectBySlug(
    @Param('slug') slug: string,
    @Query() query: LocaleQueryDto,
  ) {
    return this.publicService.getProjectBySlug(slug, query.locale);
  }

  @Get('posts')
  getPosts(@Query() query: PublicListQueryDto) {
    return this.publicService.getPosts(query);
  }

  @Get('posts/:slug')
  getPostBySlug(@Param('slug') slug: string, @Query() query: LocaleQueryDto) {
    return this.publicService.getPostBySlug(slug, query.locale);
  }
}
