export type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL' | 'VILLA' | 'WAREHOUSE';
export type ListingType = 'SALE' | 'RENT';
export type Furnishing = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE';
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface PropertyFeature {
  id: string;
  feature: string;
}

export interface PropertyOwner {
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  verified?: boolean;
  _count?: { properties: number };
}

export interface Property {
  id: string;
  userId: string;
  slug: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: string;
  address: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
  landArea?: number;
  buildingArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  garage?: number;
  certificateType?: string;
  yearBuilt?: number;
  furnishing?: Furnishing;
  status: PropertyStatus;
  moderationStatus: ModerationStatus;
  moderationNotes?: string;
  flagReason?: string;
  featured: boolean;
  viewsCount: number;
  leadsCount: number;
  rankScore: string;
  images: PropertyImage[];
  features: PropertyFeature[];
  user?: PropertyOwner;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  latitude?: number;
  longitude?: number;
  videoUrl?: string;
  floorPlanUrl?: string;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  address: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
  landArea?: number;
  buildingArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  garage?: number;
  certificateType?: string;
  yearBuilt?: number;
  furnishing?: Furnishing;
  features?: string[];
  latitude?: number;
  longitude?: number;
  videoUrl?: string;
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>;
