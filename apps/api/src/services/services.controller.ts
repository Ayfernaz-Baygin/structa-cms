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
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { ServicesService } from './services.service.js';

@UseInterceptors(TranslationConflictInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query() query: LocaleQueryDto) {
    return this.servicesService.findAll(query.locale);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: LocaleQueryDto) {
    return this.servicesService.findOne(id, query.locale);
  }

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.servicesService.remove(id);
  }
}
