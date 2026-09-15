import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { AuditAction } from '../generated/prisma/enums.js';

export const AUDIT_ENTITIES = ['Page', 'Service', 'Project', 'Post', 'Media', 'Settings', 'Menu', 'User'];

export class AuditQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000000)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number;

  @IsOptional() @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional() @IsIn(AUDIT_ENTITIES)
  entityType?: string;
}
