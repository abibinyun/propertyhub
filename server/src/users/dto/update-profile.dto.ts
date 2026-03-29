import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() license?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-z0-9-]+$/, { message: 'Username hanya boleh huruf kecil, angka, dan tanda hubung' })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;
}
