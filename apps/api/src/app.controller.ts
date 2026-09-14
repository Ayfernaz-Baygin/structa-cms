import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello() {
    return {
      name: 'Structa CMS API',
      status: 'running',
    };
  }

  @Get('health/database')
  async databaseHealth() {
    const userCount = await this.prisma.user.count();

    return {
      database: 'connected',
      users: userCount,
    };
  }
}