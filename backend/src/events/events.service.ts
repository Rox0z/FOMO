import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { events } from '../db/schema/events';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { vendorProfiles } from '../db/schema/vendorProfiles';
import type { DrizzleDB } from '../drizzle';


@Injectable()
export class EventsService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB,
  ) {}


  private parseEventDate(date: string, time?: string): Date {
    const eventDate = new Date(time ? `${date}T${time}:00` : date);
    if (Number.isNaN(eventDate.getTime())) {
      throw new BadRequestException('Invalid event date or time.');
    }
    return eventDate;
  }

  private mapUpdateDto(dto: UpdateEventDto) {
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.maxCapacity !== undefined) updateData.maxCapacity = Number(dto.maxCapacity);
    if (dto.price !== undefined) updateData.ticketPrice = Number(dto.price).toFixed(2);
    if (dto.date !== undefined || dto.time !== undefined) {
      updateData.date = this.parseEventDate(dto.date ?? new Date().toISOString().slice(0, 10), dto.time);
    }

    updateData.updatedAt = new Date();
    return updateData;
  }

  // -------------------------
  // CREATE EVENT (VENDOR ONLY)
  // -------------------------
  async create(createEventDto: CreateEventDto, userId: number, bannerUrl: string | null) {
    const vendorProfile = await this.db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.userId, userId),
    });

    if (!vendorProfile) {
      throw new ForbiddenException(' Only vendors with an active profile can create events.');
    }

    const newEvent = await this.db
      .insert(events)
      .values({
        vendorId: vendorProfile.id,
        name: createEventDto.name,
        description: createEventDto.description,
        location: createEventDto.location,
        date: this.parseEventDate(createEventDto.date, createEventDto.time),
        ticketPrice: String(createEventDto.price),
        maxCapacity: Number(createEventDto.maxCapacity),
        bannerUrl: bannerUrl,
        status: 'pending',
      })
      .returning();

    return newEvent[0];
  }

  // -------------------------
  // PUBLIC - FIND ALL APPROVED EVENTS
  // -------------------------
  async findAll() { 
  return this.db.query.events.findMany({
    where: eq(events.status, 'approved'),
    orderBy: (events, { desc }) => [desc(events.createdAt)], 
  });
}

  // -------------------------
  // ADMIN - RECALCULATE LIST WITH DETAILS
  // -------------------------
  async findAllWithDetails() {
    return this.db.query.events.findMany();
  }

  // -------------------------
  // PUBLIC - FIND ONE EVENT
  // -------------------------
  async findOne(id: number) {
    const result = await this.db
      .select({
        id: events.id,
        vendorId: events.vendorId,
        name: events.name,
        description: events.description,
        location: events.location,
        date: events.date,
        bannerUrl: events.bannerUrl,
        ticketPrice: events.ticketPrice,
        maxCapacity: events.maxCapacity,
        ticketsSold: events.ticketsSold,
        status: events.status,
        
        businessName: vendorProfiles.businessName, 
      })
      .from(events)
      .leftJoin(vendorProfiles, eq(events.vendorId, vendorProfiles.id)) 
      .where(eq(events.id, id));

    if (!result || result.length === 0) {
      throw new NotFoundException('Event not found');
    }

    return result[0];
  }

  // -------------------------
  // VENDOR - FIND MY EVENTS
  // -------------------------
  async findMyEvents(userId: number) {
    const vendorProfile = await this.db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.userId, userId),
    });

    if (!vendorProfile) {
      throw new ForbiddenException('Vendor profile not found');
    }

    return this.db.query.events.findMany({
      where: eq(events.vendorId, vendorProfile.id),
    });
  }

  // -------------------------
  // VENDOR - GET STATISTICS
  // -------------------------
  async getMyStats(userId: number) {
    const vendorProfile = await this.db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.userId, userId),
    });

    if (!vendorProfile) {
      throw new ForbiddenException('Vendor profile not found');
    }

    const myEventsList = await this.db.query.events.findMany({
      where: eq(events.vendorId, vendorProfile.id),
    });

    let totalTickets = 0;
    let totalRevenue = 0;
    let activeEvents = 0;

    for (const event of myEventsList) {
      totalTickets += event.ticketsSold;
      totalRevenue += event.ticketsSold * Number(event.ticketPrice);
      if (event.status === 'approved') {
        activeEvents++;
      }
    }

    return { totalTickets, totalRevenue, activeEvents };
  }

  // -------------------------
  // UPDATE EVENT DIRECTLY (BACKUP / ADMIN ROUTE)
  // -------------------------
  async update(id: number, dto: UpdateEventDto, user: any) {
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    const vendorProfile = await this.db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.userId, user.id),
    });

    const isOwner = vendorProfile && event.vendorId === vendorProfile.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Not allowed to edit this event');
    }

    const updated = await this.db
      .update(events)
      .set(this.mapUpdateDto(dto))
      .where(eq(events.id, id))
      .returning();

    return updated[0];
  }

  // -------------------------
  // DELETE (ADMIN ONLY)
  // -------------------------
  async remove(id: number, user: any) {
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admin can delete events');
    }

    await this.db.delete(events).where(eq(events.id, id));

    return { message: `Event ${id} deleted` };
  }

  // -------------------------
  // COUNT (MÉTRICAS ADMIN)
  // -------------------------
  async count() {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(events);
      
    return Number(result[0]?.count ?? 0);
  }
}