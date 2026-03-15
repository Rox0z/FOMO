import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private usersService: UsersService) {}

  async register(createVendorDto: CreateVendorDto): Promise<Omit<User, 'password'>> {
    // Ensure userType is set to 'vendor'
    createVendorDto.userType = 'vendor';
    
    // Use UsersService to create the vendor (which is just a user with userType='vendor')
    const vendor = await this.usersService.create(createVendorDto);
    return vendor;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const allVendors = await this.usersService.findAll();
    // Filter only vendors
    return allVendors.filter((user: any) => user.userType === 'vendor');
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const vendor = await this.usersService.findOne(id);
    return vendor;
  }

  async update(id: number, createVendorDto: CreateVendorDto): Promise<Omit<User, 'password'>> {
    // Ensure userType remains 'vendor'
    createVendorDto.userType = 'vendor';
    const updatedVendor = await this.usersService.update(id, createVendorDto);
    return updatedVendor;
  }

  async remove(id: number): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }
}
