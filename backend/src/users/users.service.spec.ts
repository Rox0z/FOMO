import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { Roles } from '../common/enums/roles.enum';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let db: any;
  let emailsService: any;
  let service: UsersService;

  const dbUser = {
    id: 1,
    email: 'user@fomo.pt',
    password: 'hashed-password',
    name: 'User Test',
    role: Roles.USER,
    active: true,
  };

  beforeEach(() => {
    db = {
      query: { users: { findFirst: jest.fn() } },
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    emailsService = { sendWelcomeEmail: jest.fn().mockResolvedValue(undefined) };
    service = new UsersService(db, emailsService);
  });

  it('creates a user with a hashed password and sends a welcome email', async () => {
    db.query.users.findFirst.mockResolvedValue(null);
    const returning = jest.fn().mockResolvedValue([dbUser]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    const result = await service.create({ email: dbUser.email, password: 'password123', name: dbUser.name, userType: 'user' });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ email: dbUser.email, password: 'hashed-password', role: Roles.USER, active: true }));
    expect(result).not.toHaveProperty('password');
    expect(emailsService.sendWelcomeEmail).toHaveBeenCalledWith(dbUser.email, dbUser.name);
  });

  it('throws ConflictException when email already exists', async () => {
    db.query.users.findFirst.mockResolvedValue(dbUser);
    await expect(service.create({ email: dbUser.email, password: 'password123', name: dbUser.name, userType: 'user' })).rejects.toThrow(ConflictException);
  });

  it('creates vendor users as inactive when overrides request it', async () => {
    db.query.users.findFirst.mockResolvedValue(null);
    const returning = jest.fn().mockResolvedValue([{ ...dbUser, role: Roles.VENDOR, active: false }]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    await service.create({ email: 'vendor@fomo.pt', password: 'password123', name: 'Vendor', userType: 'vendor' }, { role: Roles.VENDOR, active: false });
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ role: Roles.VENDOR, active: false }));
    expect(emailsService.sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it('returns safe user data from findOne', async () => {
    db.query.users.findFirst.mockResolvedValue(dbUser);
    await expect(service.findOne(1)).resolves.not.toHaveProperty('password');
  });

  it('throws NotFoundException from findOne when missing', async () => {
    db.query.users.findFirst.mockResolvedValue(null);
    await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
  });

  it('validates credentials using bcrypt', async () => {
    db.query.users.findFirst.mockResolvedValue(dbUser);
    await expect(service.validateCredentials(dbUser.email, 'password123')).resolves.toEqual(dbUser);
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
  });
});
