import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLeadDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const lead = await this.prisma.lead.create({
      data: {
        propertyId: dto.propertyId,
        userId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        source: dto.source || 'website',
      },
      include: {
        property: {
          select: {
            title: true,
            slug: true,
            city: true,
          },
        },
      },
    });

    // Increment lead count
    await this.prisma.property.update({
      where: { id: dto.propertyId },
      data: { leadsCount: { increment: 1 } },
    });

    return lead;
  }

  async findMyLeads(userId: string) {
    return this.prisma.lead.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            title: true,
            slug: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPropertyLeads(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.lead.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(userId: string, leadId: string, status: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { property: true },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (lead.property.userId !== userId) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.lead.update({
      where: { id: leadId },
      data: { status: status as any },
    });
  }
}
