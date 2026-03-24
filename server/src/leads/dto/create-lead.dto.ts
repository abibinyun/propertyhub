import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  propertyId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  source?: string;
}
