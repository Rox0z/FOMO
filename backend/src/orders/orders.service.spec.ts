import { BadRequestException, NotFoundException } from '@nestjs/common';
jest.mock('qrcode', () => ({ toBuffer: jest.fn().mockResolvedValue(Buffer.from('qr')) }));

import { OrdersService } from './orders.service';
import * as QRCode from 'qrcode';

describe('OrdersService', () => {
  let db: any;
  let tx: any;
  let emailsService: any;
  let service: OrdersService;

  const buyer = { id: 10, email: 'buyer@fomo.pt', name: 'Buyer', active: true };
  const event = {
    id: 1,
    name: 'FOMO Night',
    status: 'approved',
    ticketsSold: 10,
    maxCapacity: 100,
    ticketPrice: '20.00',
  };

  beforeEach(() => {
    emailsService = { sendOrderConfirmation: jest.fn().mockResolvedValue(undefined) };

    tx = {
      query: {
        events: { findFirst: jest.fn().mockResolvedValue(event) },
        tickets: { findFirst: jest.fn().mockResolvedValue(null) },
      },
      insert: jest.fn(),
      update: jest.fn(),
    };

    let insertCall = 0;
    tx.insert.mockImplementation(() => {
      insertCall += 1;
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(
            insertCall === 1
              ? [{ id: 99 }]
              : [{ id: insertCall, qrCode: '2a01f8e1-5f4d-4b9e-9f34-000000000001' }],
          ),
        }),
      };
    });

    tx.update.mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) });

    db = {
      query: { users: { findFirst: jest.fn().mockResolvedValue(buyer) } },
      transaction: jest.fn((callback) => callback(tx)),
    };

    service = new OrdersService(db, emailsService);
  });

  it('rejects an empty checkout', async () => {
    await expect(service.simulateCheckout(10, { items: [] })).rejects.toThrow(BadRequestException);
  });

  it('rejects missing or inactive buyers', async () => {
    db.query.users.findFirst.mockResolvedValue(null);
    await expect(service.simulateCheckout(10, { items: [{ eventId: 1, quantity: 1 }] })).rejects.toThrow(NotFoundException);
  });

  it('rejects checkout for non-approved events', async () => {
    tx.query.events.findFirst.mockResolvedValue({ ...event, status: 'pending' });
    await expect(service.simulateCheckout(10, { items: [{ eventId: 1, quantity: 1 }] })).rejects.toThrow(BadRequestException);
  });

  it('rejects duplicate purchases for the same user and event', async () => {
    tx.query.tickets.findFirst.mockResolvedValue({ id: 50 });
    await expect(service.simulateCheckout(10, { items: [{ eventId: 1, quantity: 1 }] })).rejects.toThrow(BadRequestException);
  });

  it('rejects insufficient event capacity', async () => {
    tx.query.events.findFirst.mockResolvedValue({ ...event, ticketsSold: 99, maxCapacity: 100 });
    await expect(service.simulateCheckout(10, { items: [{ eventId: 1, quantity: 2 }] })).rejects.toThrow(BadRequestException);
  });

  it('creates an order, order items, tickets and sends confirmation email', async () => {
    const result = await service.simulateCheckout(10, { items: [{ eventId: 1, quantity: 2 }] });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe(99);
    expect(result.totalAmount).toBe(44); // 40 base + 3 fixed fee + 1 variable fee
    expect(QRCode.toBuffer).toHaveBeenCalledTimes(2);
    expect(emailsService.sendOrderConfirmation).toHaveBeenCalledWith(
      'buyer@fomo.pt',
      'Buyer',
      99,
      44,
      2,
      'FOMO Night',
      expect.any(Array),
    );
  });
});
