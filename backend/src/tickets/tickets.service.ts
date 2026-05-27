import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { tickets } from '../db/schema/tickets';
import { events } from '../db/schema/events';
import type { DrizzleDB } from '../drizzle';

@Injectable()
export class TicketsService {
  constructor(@Inject('DRIZZLE') private db: DrizzleDB) {}

  async findMyTickets(userId: number) {
    // Fazemos um JOIN com os Eventos para ter o Nome, Data e Local no Angular!
    const myTickets = await this.db
      .select({
        id: tickets.id,
        qrCode: tickets.qrCode,
        status: tickets.status,
        createdAt: tickets.createdAt,
        eventName: events.name,
        eventDate: events.date,
        location: events.location,
      })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.userId, userId));

    return myTickets;
  }
}