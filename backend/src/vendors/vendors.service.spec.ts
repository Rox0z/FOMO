import { Test, TestingModule } from '@nestjs/testing';
import { VendorsService } from './vendors.service';
import { UsersService } from '../users/users.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

describe('VendorsService', () => {
  let service: VendorsService;
  let usersService: UsersService;
  let mockDb: any;

  const mockVendor = {
    id: 1,
    email: 'vendor@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test Vendor',
    phone: '123456789',
    countryCode: '+1',
    userType: 'vendor' as const,
    superuser: false,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createVendorDto: CreateVendorDto = {
    email: 'vendor@example.com',
    password: 'password123',
    name: 'Test Vendor',
    phone: '123456789',
    countryCode: '+1',
    businessName: 'Vendor Business',
    businessDescription: 'A test vendor business',
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        users: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: 'DRIZZLE',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new vendor with active=false', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(mockVendor);

      const result = await service.register(createVendorDto);

      expect(result).toEqual(mockVendor);
      expect(result.userType).toEqual('vendor');
      expect(result.active).toEqual(false);
      expect(usersService.create).toHaveBeenCalledWith({
        ...createVendorDto,
        userType: 'vendor',
      });
    });

    it('should include businessName and businessDescription in user data', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(mockVendor);

      await service.register(createVendorDto);

      const callArgs = (usersService.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.email).toEqual(createVendorDto.email);
      expect(callArgs.name).toEqual(createVendorDto.name);
      expect(callArgs.userType).toEqual('vendor');
    });
  });

  describe('findAll', () => {
    it('should return all vendors filtered by userType', async () => {
      const vendors = [
        mockVendor,
        { ...mockVendor, id: 2, email: 'vendor2@example.com' },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValue(vendors);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].userType).toEqual('vendor');
    });
  });

  describe('findOne', () => {
    it('should return a vendor by id', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockVendor);

      const result = await service.findOne(1);

      expect(result.id).toEqual(1);
      expect(result.userType).toEqual('vendor');
    });
  });

  describe('update', () => {
    it('should update a vendor and ensure userType remains vendor', async () => {
      const updatedVendor = { ...mockVendor, name: 'Updated Vendor' };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedVendor);

      const updateDto: CreateVendorDto = {
        ...createVendorDto,
        name: 'Updated Vendor',
      };

      const result = await service.update(1, updateDto);

      expect(result.name).toEqual('Updated Vendor');
      expect(result.userType).toEqual('vendor');
    });
  });

  describe('remove', () => {
    it('should delete a vendor', async () => {
      const response = { message: 'User with id 1 deleted successfully' };

      jest.spyOn(usersService, 'remove').mockResolvedValue(response);

      const result = await service.remove(1);

      expect(result.message).toContain('deleted');
    });
  });
});
