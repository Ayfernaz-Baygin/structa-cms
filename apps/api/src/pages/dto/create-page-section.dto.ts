import { IsEnum, IsInt, IsObject, IsOptional, Min } from 'class-validator';

import { SectionType } from '../../generated/prisma/enums.js';

export class CreatePageSectionDto {
  @IsEnum(SectionType)
  type: SectionType;

  @IsObject()
  data: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
