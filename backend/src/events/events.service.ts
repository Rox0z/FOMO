import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { events } from '../db/schema/events';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

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
}