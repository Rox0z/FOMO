import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { ConflictException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';

describe('VendorsController', () => {
  let controller: VendorsController;
  let service: VendorsService;

  const mockVendor = {
    id: 1,
    email: 'vendor@example.com',
    name: 'Test Vendor',
    phone: '123456789',
    countryCode: '+1',
    userType: 'vendor' as const,
    superuser: false,
    active: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [
        {
          provide: VendorsService,
          useValue: {
            register: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VendorsController>(VendorsController);
    service = module.get<VendorsService>(VendorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register (POST /vendors)', () => {
    it('should register a new vendor with active=false', async () => {
      const createVendorDto: CreateVendorDto = {
        email: 'vendor@example.com',
        password: 'password123',
        name: 'Test Vendor',
        phone: '123456789',
        countryCode: '+1',
        businessName: 'Vendor Business',
        businessDescription: 'A test vendor business',
      };

      jest.spyOn(service, 'register').mockResolvedValue(mockVendor);

      const result = await controller.register(createVendorDto);

      expect(result).toEqual(mockVendor);
      expect(result.active).toEqual(false);
      expect(result.userType).toEqual('vendor');
      expect(service.register).toHaveBeenCalledWith(createVendorDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createVendorDto: CreateVendorDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test Vendor',
        phone: '123456789',
        countryCode: '+1',
        businessName: 'Vendor Business',
        businessDescription: 'A test vendor business',
      };

      jest
        .spyOn(service, 'register')
        .mockRejectedValue(new ConflictException('Email already exists'));

      await expect(controller.register(createVendorDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll (GET /vendors)', () => {
    it('should return all vendors', async () => {
      const vendors = [
        mockVendor,
        { ...mockVendor, id: 2, email: 'vendor2@example.com' },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(vendors);

      const result = await controller.findAll();

      expect(result).toEqual(vendors);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne (GET /vendors/:id)', () => {
    it('should return a vendor by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockVendor);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockVendor);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update (PATCH /vendors/:id)', () => {
    it('should update a vendor', async () => {
      const updateVendorDto: CreateVendorDto = {
        email: 'vendor@example.com',
        password: 'password123',
        name: 'Updated Vendor',
        phone: '123456789',
        countryCode: '+1',
        businessName: 'Updated Business',
        businessDescription: 'Updated description',
      };

      const updatedVendor = { ...mockVendor, name: 'Updated Vendor' };

      jest.spyOn(service, 'update').mockResolvedValue(updatedVendor);

      const result = await controller.update('1', updateVendorDto);

      expect(result).toEqual(updatedVendor);
      expect(service.update).toHaveBeenCalledWith(1, updateVendorDto);
    });
  });

  describe('remove (DELETE /vendors/:id)', () => {
    it('should delete a vendor', async () => {
      const response = { message: 'User with id 1 deleted successfully' };

      jest.spyOn(service, 'remove').mockResolvedValue(response);

      const result = await controller.remove('1');

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
