import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';

class ReorderMenuItemEntryDto {
  @IsUUID()
  id: string;

  @IsInt()
  sortOrder: number;
}

export class ReorderMenuItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderMenuItemEntryDto)
  items: ReorderMenuItemEntryDto[];
}
