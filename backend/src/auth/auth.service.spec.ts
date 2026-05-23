import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    phone: '123456789',
    countryCode: '+1',
    userType: 'user' as const,
    superuser: false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    phone: '123456789',
    countryCode: '+1',
    userType: 'user',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            validateCredentials: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return user with token', async () => {
      const mockToken = 'test-jwt-token';
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await service.register(mockCreateUserDto);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toEqual(mockToken);
      expect(usersService.create).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('login', () => {
    it('should login user and return user with token', async () => {
      const mockToken = 'test-jwt-token';
      jest
        .spyOn(usersService, 'validateCredentials')
        .mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await service.login(mockLoginDto);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toEqual(mockToken);
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
    });

    it('should return null if credentials are invalid', async () => {
      jest
        .spyOn(usersService, 'validateCredentials')
        .mockResolvedValue(null);

      const result = await service.login(mockLoginDto);

      expect(result).toBeNull();
    });
  });

  describe('validateUserFromToken', () => {
    it('should return user by id', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await service.validateUserFromToken(1);

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw if user not found', async () => {
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new Error('User not found'));

      await expect(service.validateUserFromToken(999)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
