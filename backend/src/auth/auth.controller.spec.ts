import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authService: any;
  let controller: AuthController;

  beforeEach(() => {
    authService = { register: jest.fn(), login: jest.fn() };
    controller = new AuthController(authService);
  });

  it('registers a user', async () => {
    authService.register.mockResolvedValue({ token: 'jwt' });
    await expect(controller.register({ email: 'u@fomo.pt', password: 'password123', name: 'User', userType: 'user' })).resolves.toEqual({ token: 'jwt' });
  });

  it('throws UnauthorizedException when login fails', async () => {
    authService.login.mockResolvedValue(null);
    await expect(controller.login({ email: 'u@fomo.pt', password: 'password123' })).rejects.toThrow(UnauthorizedException);
  });

  it('returns profile from request user', async () => {
    const user = { id: 1, email: 'u@fomo.pt' };
    await expect(controller.getProfile(user)).resolves.toEqual(user);
  });
});
