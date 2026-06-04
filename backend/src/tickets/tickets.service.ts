import { Injectable, Inject } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { tickets } from '../db/schema/tickets';
import { events } from '../db/schema/events';
import type { DrizzleDB } from '../drizzle';
import * as QRCode from 'qrcode';


@Injectable()
export class TicketsService {
  constructor(@Inject('DRIZZLE') private db: DrizzleDB) {}

  async findMyTickets(userId: number) {
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
      .where(eq(tickets.userId, userId))
      .orderBy(asc(tickets.id));


      const ticketsWithQr = await Promise.all(
      myTickets.map(async (ticket) => {
        let qrCodeDataUrl = '';
        if (ticket.qrCode) {
          qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode, {
            margin: 4,
            errorCorrectionLevel: 'L',
            version: 3,
            width: 150,
            color: {
              dark: '#1a0b2e',
              light: '#ffffff',
            },
          });
        }
        return {
          ...ticket,
          qrCodeDataUrl,
        };
      })
    );

    return ticketsWithQr;
  }



}