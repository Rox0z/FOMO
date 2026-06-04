import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from '../common/enums/roles.enum';

describe('AuthService', () => {
  let usersService: any;
  let vendorsService: any;
  let jwtService: any;
  let service: AuthService;

  const user = {
    id: 1,
    email: 'user@fomo.pt',
    password: 'hashed',
    name: 'User Test',
    role: Roles.USER,
    active: true,
  };

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      checkPassword: jest.fn(),
      findOne: jest.fn(),
    };
    vendorsService = {
      createProfile: jest.fn(),
      findByUserId: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token') };
    service = new AuthService(usersService, vendorsService, jwtService);
  });

  it('rejects public admin registration', async () => {
    await expect(service.register({ email: 'a@b.pt', password: 'password123', name: 'Admin', userType: 'admin' as any })).rejects.toThrow(ForbiddenException);
  });

  it('registers a normal user and returns a JWT', async () => {
    const safeUser = { id: 1, email: user.email, name: user.name, role: Roles.USER, active: true };
    usersService.create.mockResolvedValue(safeUser);

    const result = await service.register({ email: user.email, password: 'password123', name: user.name, userType: 'user' });

    expect(result).toEqual({ user: safeUser, token: 'jwt-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: safeUser.id, role: safeUser.role }, { expiresIn: '24h' });
  });

  it('registers a vendor as inactive and creates a pending vendor profile', async () => {
    const safeVendor = { id: 2, email: 'vendor@fomo.pt', name: 'Vendor', role: Roles.VENDOR, active: false };
    const profile = { id: 10, userId: 2, status: 'pending' };
    usersService.create.mockResolvedValue(safeVendor);
    vendorsService.createProfile.mockResolvedValue(profile);

    const result = await service.register({
      email: safeVendor.email,
      password: 'password123',
      name: safeVendor.name,
      userType: 'vendor',
      businessName: 'Vendor Business',
      businessDescription: 'Events',
    });

    expect(usersService.create).toHaveBeenCalledWith(expect.any(Object), { role: 'vendor', active: false });
    expect(vendorsService.createProfile).toHaveBeenCalledWith({ userId: 2, businessName: 'Vendor Business', businessDescription: 'Events' });
    expect(result.vendorProfile).toEqual(profile);
  });

  it('returns invalid_credentials when the user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'missing@fomo.pt', password: 'password123' })).resolves.toEqual({ error: 'invalid_credentials' });
  });

  it('returns account_blocked for inactive users', async () => {
    usersService.findByEmail.mockResolvedValue({ ...user, active: false });
    usersService.checkPassword.mockResolvedValue(true);
    await expect(service.login({ email: user.email, password: 'password123' })).resolves.toEqual({ error: 'account_blocked' });
  });

  it('returns vendor_not_approved for pending vendors', async () => {
    usersService.findByEmail.mockResolvedValue({ ...user, role: Roles.VENDOR });
    usersService.checkPassword.mockResolvedValue(true);
    vendorsService.findByUserId.mockResolvedValue({ status: 'pending' });

    await expect(service.login({ email: user.email, password: 'password123' })).resolves.toEqual({ error: 'vendor_not_approved' });
  });

  it('logs in approved users and strips password from the response', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    usersService.checkPassword.mockResolvedValue(true);

    const result = await service.login({ email: user.email, password: 'password123' });

    expect(result).toEqual({ user: expect.not.objectContaining({ password: expect.anything() }), token: 'jwt-token' });
  });
});
