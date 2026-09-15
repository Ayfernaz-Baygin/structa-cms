import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectImageDto {
  @IsString()
  @MinLength(1)
  imageUrl: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
