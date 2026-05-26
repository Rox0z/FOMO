import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    phone: '123456789',
    countryCode: '+1',
    userType: 'user' as const,
    superuser: false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    phone: '123456789',
    countryCode: '+1',
    userType: 'user',
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        users: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'DRIZZLE',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const hashedPassword = '$2b$10$hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockDb.query.users.findFirst.mockResolvedValue(null);
      const mockInsert = jest.fn().mockReturnValue({
        values: jest
          .fn()
          .mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
      });
      mockDb.insert.mockReturnValue(mockInsert());

      const result = await service.create(createUserDto);

      expect(result.email).toEqual(mockUser.email);
      expect(result).not.toHaveProperty('password');
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        10,
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set vendor as inactive by default', async () => {
      const vendorDto: CreateUserDto = {
        ...createUserDto,
        userType: 'vendor',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const vendorUser = {
        ...mockUser,
        userType: 'vendor',
        active: false,
      };

      const mockInsert = jest.fn().mockReturnValue({
        values: jest
          .fn()
          .mockReturnValue({
            returning: jest.fn().mockResolvedValue([vendorUser]),
          }),
      });
      mockDb.insert.mockReturnValue(mockInsert());

      const result = await service.create(vendorDto);

      expect(result.active).toEqual(false);
      expect(result.userType).toEqual('vendor');
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: 2, email: 'user2@example.com' },
      ];
      mockDb.query.users.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result.id).toEqual(1);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result.email).toEqual('test@example.com');
    });

    it('should return null if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest
          .fn()
          .mockReturnValue({
            where: jest
              .fn()
              .mockReturnValue({
                returning: jest.fn().mockResolvedValue([updatedUser]),
              }),
          }),
      });
      mockDb.update.mockReturnValue(mockUpdate());

      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      const result = await service.update(1, updateDto);

      expect(result.name).toEqual('Updated Name');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should hash password if provided in update', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      const newHashedPassword = '$2b$10$newhash';
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedPassword);

      const mockUpdate = jest.fn().mockReturnValue({
        set: jest
          .fn()
          .mockReturnValue({
            where: jest
              .fn()
              .mockReturnValue({
                returning: jest.fn().mockResolvedValue([mockUser]),
              }),
          }),
      });
      mockDb.update.mockReturnValue(mockUpdate());

      const updateDto: UpdateUserDto = { password: 'newpassword' };
      await service.update(1, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const mockDelete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      });
      mockDb.delete.mockReturnValue(mockDelete());

      const result = await service.remove(1);

      expect(result.message).toContain('deleted');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateCredentials', () => {
    it('should return user if credentials are valid', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateCredentials(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await service.validateCredentials(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateCredentials(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });
});
