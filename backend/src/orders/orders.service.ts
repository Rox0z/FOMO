import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { orders } from '../db/schema/orders';
import { tickets } from '../db/schema/tickets';
import { events } from 'src/db/schema/events';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import type { DrizzleDB } from '../drizzle';
import { EmailsService } from '../services/emails/emails.service';
import { users } from 'src/db/schema/users';
import { orderItems } from 'src/db/schema/order.items';
import * as QRCode from 'qrcode';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB, 
    private emailsService: EmailsService
  ) {}


  async simulateCheckout(userId: number, dto: CreateOrderDto) {
    const buyer = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return await this.db.transaction(async (tx) => {
      const allQrCodeBuffers: Buffer[] = [];
      const eventNames: string[] = [];
      let grandTotal = 0;
      let totalQuantity = 0;
      let totalBasePrice = 0;

      const sortedItems = [...dto.items].sort((a, b) => a.eventId - b.eventId);

      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId,
          totalPrice: '0.00',
          status: 'completed',
        })
        .returning();

      for (const item of sortedItems) {
        const event = await tx.query.events.findFirst({
          where: eq(events.id, item.eventId),
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${item.eventId} was not found.`);
        }

        if (event.ticketsSold + item.quantity > event.maxCapacity) {
          throw new BadRequestException(
            `Insufficient capacity for event "${event.name}". Available: ${event.maxCapacity - event.ticketsSold}, requested: ${item.quantity}.`
          );
        }

        eventNames.push(event.name);
        totalQuantity += item.quantity;

        const unitPrice = parseFloat(event.ticketPrice);
        const subtotal = unitPrice * item.quantity;
        totalBasePrice += subtotal;

        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          eventId: item.eventId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          subtotal: subtotal.toFixed(2),
        });

        const insertedTickets: any[] = [];
        for (let i = 0; i < item.quantity; i++) {
          const uniqueTicketUuid = crypto.randomUUID();
          const [t] = await tx
            .insert(tickets)
            .values({
              orderId: newOrder.id,
              eventId: item.eventId,
              userId,
              qrCode: uniqueTicketUuid,
              status: 'valid',
            })
            .returning();
          insertedTickets.push(t);
        }

        await tx
          .update(events)
          .set({ ticketsSold: event.ticketsSold + item.quantity })
          .where(eq(events.id, item.eventId));

        // Gerar QR codes para email
        for (const ticket of insertedTickets.sort((a, b) => a.id - b.id)) {
          const buffer = await QRCode.toBuffer(ticket.qrCode, {
            type: 'png', margin: 4, errorCorrectionLevel: 'L',
            version: 3, width: 150,
            color: { dark: '#1a0b2e', light: '#ffffff' },
          });
          allQrCodeBuffers.push(buffer);
        }
      }

      const serviceFee = (totalQuantity * 1.50) + (totalBasePrice * 0.025);
      grandTotal = totalBasePrice + serviceFee;

      await tx
        .update(orders)
        .set({ totalPrice: grandTotal.toFixed(2) })
        .where(eq(orders.id, newOrder.id));

      if (buyer?.email) {
        this.emailsService.sendOrderConfirmation(
          buyer.email, buyer.name,
          newOrder.id, grandTotal, totalQuantity,
          eventNames.join(', '),
          allQrCodeBuffers
        );
      }

      return {
        success: true,
        orderId: newOrder.id,
        totalAmount: grandTotal,
      };
    });
}
} 