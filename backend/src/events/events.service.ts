import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { events } from '../db/schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(@Inject('DRIZZLE') private db: any) {}

  async create(createEventDto: CreateEventDto) {
  try {
    const newEvent = await this.db
      .insert(events)
      .values({
        ...createEventDto,
        date: new Date(createEventDto.date),
      })
      .returning();

    return newEvent[0];
  } catch (error) {
    console.log(error);
    throw new BadRequestException('Failed to create event');
  }
}

  async findAll(): Promise<Event[]> {
    const allEvents = await this.db.query.events.findMany();
    return allEvents as Event[];
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event as Event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const existingEvent = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedEvent = await this.db
      .update(events)
      .set(updateEventDto)
      .where(eq(events.id, id))
      .returning();

    return updatedEvent[0] as Event;
  }

  async remove(id: number): Promise<{ message: string }> {
    const existingEvent = await this.db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    await this.db.delete(events).where(eq(events.id, id));

    return { message: `Event with ID ${id} has been deleted` };
  }
}