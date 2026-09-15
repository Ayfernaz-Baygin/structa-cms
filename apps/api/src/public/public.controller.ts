import { Controller, Get, Param, Query } from '@nestjs/common';

import { PublicListQueryDto } from './dto/public-list-query.dto.js';
import { PublicService } from './public.service.js';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('settings')
  getSettings() {
    return this.publicService.getSettings();
  }

  @Get('menus')
  getMenus() {
    return this.publicService.getMenus();
  }

  @Get('menus/:location')
  getMenuByLocation(@Param('location') location: string) {
    return this.publicService.getMenuByLocation(location);
  }

  @Get('pages/:slug')
  getPageBySlug(@Param('slug') slug: string) {
    return this.publicService.getPageBySlug(slug);
  }

  @Get('services')
  getServices(@Query() query: PublicListQueryDto) {
    return this.publicService.getServices(query);
  }

  @Get('services/:slug')
  getServiceBySlug(@Param('slug') slug: string) {
    return this.publicService.getServiceBySlug(slug);
  }

  @Get('projects')
  getProjects(@Query() query: PublicListQueryDto) {
    return this.publicService.getProjects(query);
  }

  @Get('projects/:slug')
  getProjectBySlug(@Param('slug') slug: string) {
    return this.publicService.getProjectBySlug(slug);
  }

  @Get('posts')
  getPosts(@Query() query: PublicListQueryDto) {
    return this.publicService.getPosts(query);
  }

  @Get('posts/:slug')
  getPostBySlug(@Param('slug') slug: string) {
    return this.publicService.getPostBySlug(slug);
  }
}
