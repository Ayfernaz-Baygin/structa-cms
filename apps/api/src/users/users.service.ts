import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

import type { User } from '../generated/prisma/client.js';
import { UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async findAllSafe() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((user) => this.toSafeUser(user));
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Bu e-posta zaten kullanılıyor.');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
    });

    return this.toSafeUser(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        isActive: dto.isActive,
      },
    });

    return this.toSafeUser(user);
  }

  private toSafeUser(user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
