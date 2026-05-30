import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadImageDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;
}
