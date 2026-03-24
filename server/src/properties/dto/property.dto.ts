import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, IsArray, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyTitleValidator } from '../validators/title.validator';

export class CreatePropertyDto {
  @IsString()
  @Validate(PropertyTitleValidator)
  title: string;

  @IsString()
  description: string;

  @IsEnum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL', 'VILLA', 'WAREHOUSE'])
  propertyType: string;

  @IsEnum(['SALE', 'RENT'])
  listingType: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  district: string; // REQUIRED for SEO URL structure

  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  landArea?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buildingArea?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  floors?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  garage?: number;

  @IsOptional()
  @IsString()
  certificateType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  yearBuilt?: number;

  @IsOptional()
  @IsEnum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'])
  furnishing?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL', 'VILLA', 'WAREHOUSE'])
  propertyType?: string;

  @IsOptional()
  @IsEnum(['SALE', 'RENT'])
  listingType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  landArea?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buildingArea?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  floors?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  garage?: number;

  @IsOptional()
  @IsString()
  certificateType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  yearBuilt?: number;

  @IsOptional()
  @IsEnum(['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'])
  furnishing?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'ACTIVE', 'SOLD', 'RENTED', 'INACTIVE'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}
