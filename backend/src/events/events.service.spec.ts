import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Roles } from '../common/enums/roles.enum';

describe('EventsService', () => {
  let db: any;
  let service: EventsService;

  beforeEach(() => {
    db = {
      query: {
        vendorProfiles: { findFirst: jest.fn() },
        events: { findFirst: jest.fn(), findMany: jest.fn() },
      },
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      select: jest.fn(),
    };
    service = new EventsService(db);
  });

  it('creates pending events for vendors and combines date with time', async () => {
    db.query.vendorProfiles.findFirst.mockResolvedValue({ id: 4, userId: 9 });
    const returning = jest.fn().mockResolvedValue([{ id: 1, status: 'pending' }]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    const dto = {
      name: 'FOMO Rooftop',
      description: 'Opening night',
      location: 'Faro',
      date: '2026-06-20',
      time: '23:30',
      price: 18,
      maxCapacity: 200,
    };

    await expect(service.create(dto, 9, '/uploads/banner.jpg')).resolves.toEqual({ id: 1, status: 'pending' });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      vendorId: 4,
      status: 'pending',
      ticketPrice: '18',
      maxCapacity: 200,
      bannerUrl: '/uploads/banner.jpg',
    }));
    expect(values.mock.calls[0][0].date).toBeInstanceOf(Date);
  });

  it('rejects event creation without a vendor profile', async () => {
    db.query.vendorProfiles.findFirst.mockResolvedValue(null);
    await expect(service.create({} as any, 99, null)).rejects.toThrow(ForbiddenException);
  });

  it('validates event date values', () => {
    expect(() => (service as any).parseEventDate('invalid-date', '25:99')).toThrow(BadRequestException);
  });

  it('returns approved events only for public listing', async () => {
    db.query.events.findMany.mockResolvedValue([{ id: 1, status: 'approved' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: 1, status: 'approved' }]);
  });

  it('throws NotFoundException when event does not exist', async () => {
    const where = jest.fn().mockResolvedValue([]);
    const leftJoin = jest.fn().mockReturnValue({ where });
    const from = jest.fn().mockReturnValue({ leftJoin });
    db.select.mockReturnValue({ from });

    await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
  });

  it('allows admins to delete events', async () => {
    db.query.events.findFirst.mockResolvedValue({ id: 1 });
    const where = jest.fn().mockResolvedValue(undefined);
    db.delete.mockReturnValue({ where });

    await expect(service.remove(1, { role: Roles.ADMIN })).resolves.toEqual({ message: 'Event 1 deleted' });
  });
});
