import { NotFoundException } from '@nestjs/common';
import { VendorsService } from './vendors.service';

describe('VendorsService', () => {
  let db: any;
  let service: VendorsService;

  beforeEach(() => {
    db = {
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new VendorsService({} as any, db);
  });

  it('creates a pending vendor profile', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 1, userId: 7, status: 'pending' }]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    await expect(service.createProfile({ userId: 7, businessName: 'FOMO Algarve', businessDescription: 'Events' })).resolves.toEqual({ id: 1, userId: 7, status: 'pending' });
    expect(values).toHaveBeenCalledWith({ userId: 7, businessName: 'FOMO Algarve', businessDescription: 'Events', status: 'pending' });
  });

  it('lists vendors with joined user data', async () => {
    const innerJoin = jest.fn().mockResolvedValue([{ id: 1, businessName: 'Vendor' }]);
    const from = jest.fn().mockReturnValue({ innerJoin });
    db.select.mockReturnValue({ from });

    await expect(service.findAll()).resolves.toEqual([{ id: 1, businessName: 'Vendor' }]);
    expect(db.select).toHaveBeenCalled();
  });

  it('throws when vendor profile by user id does not exist', async () => {
    const where = jest.fn().mockResolvedValue([]);
    const innerJoin = jest.fn().mockReturnValue({ where });
    const from = jest.fn().mockReturnValue({ innerJoin });
    db.select.mockReturnValue({ from });

    await expect(service.findByUserId(99)).rejects.toThrow(NotFoundException);
  });

  it('updates the current vendor profile', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 1, businessName: 'Updated' }]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    await expect(service.updateByUserId(7, { businessName: 'Updated' })).resolves.toEqual({ id: 1, businessName: 'Updated' });
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ businessName: 'Updated', updatedAt: expect.any(Date) }));
  });

  it('removes vendor profile and linked user', async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    db.delete.mockReturnValue({ where });

    await expect(service.remove(7)).resolves.toEqual({ message: 'Vendor 7 removed' });
    expect(db.delete).toHaveBeenCalledTimes(2);
  });
});
