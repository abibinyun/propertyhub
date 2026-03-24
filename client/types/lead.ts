export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED' | 'LOST';

export interface Lead {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  source?: string;
  createdAt: string;
}

export interface CreateLeadDto {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}
