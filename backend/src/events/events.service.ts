import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { events } from '../db/schema/events';
import { eventEdits } from '../db/schema/event.edits';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { vendorProfiles } from 'src/db/schema/vendorProfiles';
import { tickets } from 'src/db/schema/tickets';

@Injectable()
export class EventsService {
  constructor(@Inject('DRIZZLE') private db: any) {}

  // -------------------------
  // CREATE EVENT (VENDOR ONLY)
  // -------------------------
  async create(createEventDto: CreateEventDto, userId: number, bannerUrl: string | null) {
    const vendorProfile = await this.db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.userId, userId),
    });

    if (!vendorProfile) {
      throw new ForbiddenException('Apenas utilizadores com perfil de Vendor ativo podem criar eventos.');
    }

    if (vendorProfile.status !== 'approved') {
      throw new ForbiddenException(
        `A tua conta de Vendor está atualmente: ${vendorProfile.status}. Não podes criar eventos até seres aprovado pelo Admin.`
      );
    }

    const newEvent = await this.db
      .insert(events)
      .values({
        vendorId: vendorProfile.id,
        name: createEventDto.name,
        description: createEventDto.description,
        location: createEventDto.location,
        date: new Date(createEventDto.date),
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
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
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
  // ADMIN CONTROL - SET STATUS
  // -------------------------
  async setStatus(id: number, status: 'approved' | 'rejected' | 'pending') {
    const updated = await this.db
      .update(events)
      .set({ status })
      .where(eq(events.id, id))
      .returning();

    if (updated.length === 0) throw new NotFoundException('Event not found');
    return updated[0];
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
      .set(dto)
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

  async count() {
    const result = await this.db.query.events.findMany();
    return result.length;
  }
}