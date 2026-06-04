import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { CreateOrderDto } from './dto/create-order.dto';
import { orders } from '../db/schema/orders';
import { tickets } from '../db/schema/tickets';
import { events } from '../db/schema/events';
import { users } from '../db/schema/users';
import { orderItems } from '../db/schema/order.items';
import type { DrizzleDB } from '../drizzle';
import { EmailsService } from '../services/emails/emails.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB,
    private emailsService: EmailsService,
  ) {}

  async simulateCheckout(userId: number, dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Checkout requires at least one item.');
    }

    const buyer = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!buyer || !buyer.active) {
      throw new NotFoundException('Buyer was not found or is not active.');
    }

    const result = await this.db.transaction(async (tx) => {
      const allQrCodeBuffers: Buffer[] = [];
      const eventNames: string[] = [];
      let totalQuantity = 0;
      let totalBasePrice = 0;

      const aggregatedItems = Array.from(
        dto.items.reduce((acc, item) => {
          const currentQuantity = acc.get(item.eventId) ?? 0;
          acc.set(item.eventId, currentQuantity + item.quantity);
          return acc;
        }, new Map<number, number>()),
        ([eventId, quantity]) => ({ eventId, quantity }),
      ).sort((a, b) => a.eventId - b.eventId);

      for (const item of aggregatedItems) {
        const event = await tx.query.events.findFirst({
          where: eq(events.id, item.eventId),
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${item.eventId} was not found.`);
        }

        if (event.status !== 'approved') {
          throw new BadRequestException(`Event "${event.name}" is not available for checkout.`);
        }

        const existingTicket = await tx.query.tickets.findFirst({
          where: and(eq(tickets.userId, userId), eq(tickets.eventId, item.eventId)),
        });

        if (existingTicket) {
          throw new BadRequestException(`User already has tickets for event "${event.name}".`);
        }

        if (event.ticketsSold + item.quantity > event.maxCapacity) {
          throw new BadRequestException(
            `Insufficient capacity for event "${event.name}". Available: ${event.maxCapacity - event.ticketsSold}, requested: ${item.quantity}.`,
          );
        }
      }

      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId,
          totalPrice: '0.00',
          status: 'completed',
          paymentReference: `SIM-${crypto.randomUUID()}`,
        })
        .returning();

      for (const item of aggregatedItems) {
        const event = await tx.query.events.findFirst({
          where: eq(events.id, item.eventId),
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${item.eventId} was not found.`);
        }

        eventNames.push(event.name);
        totalQuantity += item.quantity;

        const unitPrice = Number(event.ticketPrice);
        const subtotal = unitPrice * item.quantity;
        totalBasePrice += subtotal;

        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          eventId: item.eventId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          subtotal: subtotal.toFixed(2),
        });

        const insertedTickets: Array<{ id: number; qrCode: string }> = [];
        for (let i = 0; i < item.quantity; i++) {
          const [ticket] = await tx
            .insert(tickets)
            .values({
              orderId: newOrder.id,
              eventId: item.eventId,
              userId,
              qrCode: crypto.randomUUID(),
              status: 'active',
            })
            .returning();
          insertedTickets.push(ticket);
        }

        await tx
          .update(events)
          .set({ ticketsSold: event.ticketsSold + item.quantity, updatedAt: new Date() })
          .where(eq(events.id, item.eventId));

        for (const ticket of insertedTickets.sort((a, b) => a.id - b.id)) {
          const buffer = await QRCode.toBuffer(ticket.qrCode, {
            type: 'png',
            margin: 4,
            errorCorrectionLevel: 'L',
            version: 3,
            width: 150,
            color: { dark: '#1a0b2e', light: '#ffffff' },
          });
          allQrCodeBuffers.push(buffer);
        }
      }

      const serviceFee = totalQuantity * 1.5 + totalBasePrice * 0.025;
      const grandTotal = totalBasePrice + serviceFee;

      await tx
        .update(orders)
        .set({ totalPrice: grandTotal.toFixed(2) })
        .where(eq(orders.id, newOrder.id));

      return {
        success: true,
        orderId: newOrder.id,
        totalAmount: grandTotal,
        emailData: {
          buyerEmail: buyer.email,
          buyerName: buyer.name,
          totalQuantity,
          eventNames: eventNames.join(', '),
          qrCodeBuffers: allQrCodeBuffers,
        },
      };
    });

    void this.emailsService
      .sendOrderConfirmation(
        result.emailData.buyerEmail,
        result.emailData.buyerName,
        result.orderId,
        result.totalAmount,
        result.emailData.totalQuantity,
        result.emailData.eventNames,
        result.emailData.qrCodeBuffers,
      )
      .catch(() => undefined);

    return {
      success: result.success,
      orderId: result.orderId,
      totalAmount: result.totalAmount,
    };
  }
}
