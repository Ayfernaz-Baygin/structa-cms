import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class UpdatePageSectionDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
