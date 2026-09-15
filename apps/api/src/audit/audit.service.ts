import { Injectable } from '@nestjs/common';
import { AuditAction } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditQueryDto } from './audit-query.dto.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(userId: string, action: AuditAction, entityType: string, entityId: string, metadata?: { revisionId?: string }) {
    // Allowlist only structural identifiers. Never persist bodies, tokens or user snapshots.
    const safeMetadata = metadata?.revisionId ? { revisionId: metadata.revisionId } : undefined;
    return this.prisma.auditLog.create({ data: { userId, action, entityType, entityId, metadata: safeMetadata } });
  }

  async findAll(query: AuditQueryDto) {
    const { page = 1, limit = 20, action, entityType } = query;
    const where = { action, entityType };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, skip: (page - 1) * limit, take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
