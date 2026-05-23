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
import { Event } from './entities/event.entity';
import { vendorProfiles } from 'src/db/schema/vendorProfiles';
import { tickets } from 'src/db/schema/tickets';

@Injectable()
export class EventsService {
  constructor(@Inject('DRIZZLE') private db: any) {}

  // -------------------------
  // CREATE EVENT (VENDOR ONLY)
  // -------------------------
  async create(createEventDto: CreateEventDto, userId: number) {
    try {
      const newEvent = await this.db
        .insert(events)
        .values({
          ...createEventDto,
          date: new Date(createEventDto.date),
          createdBy: userId, // 🔥 IMPORTANT
        })
        .returning();

      return newEvent[0];
    } catch (error) {
      throw new BadRequestException('Failed to create event');
    }
  }

  async findAllWithDetails() {
    return this.db
      .select({
        id: events.id,
        name: events.name,
        description: events.description,
        location: events.location,
        date: events.date,
        status: events.status,
        createdAt: events.createdAt,
        vendorName: vendorProfiles.businessName,
        vendorId: events.vendorId,
        ticketCount: sql<number>`coalesce(count(${tickets.id}), 0)::int`
      })
      .from(events)
      // 🎯 CORREÇÃO: Junta usando o vendorId que aponta para o id do Perfil, e não o userId!
      .leftJoin(vendorProfiles, eq(events.vendorId, vendorProfiles.id)) 
      .leftJoin(tickets, eq(events.id, tickets.eventId))
      .groupBy(events.id, vendorProfiles.id);
  }

  // -------------------------
  // FIND ALL (PUBLIC)
  // -------------------------
  async findAll(): Promise<Event[]> {
    return this.db.query.events.findMany();
  }

  // -------------------------
  // FIND ONE (PUBLIC)
  // -------------------------
  async findOne(id: number): Promise<Event> {
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  // -------------------------
  // UPDATE (OWNER OR ADMIN)
  // -------------------------
  async update(id: number, dto: UpdateEventDto, user: any): Promise<Event> {
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }

    const isOwner = event.createdBy === user.id;
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

  async setStatus(id: number, status: 'approved' | 'pending' | 'rejected') {
    const updated = await this.db
      .update(events)
      .set({ status: status })
      .where(eq(events.id, id))
      .returning();

    if (!updated.length) {
      throw new NotFoundException(`Evento com ID ${id} não foi encontrado`);
    }

    return updated[0];
  }
}