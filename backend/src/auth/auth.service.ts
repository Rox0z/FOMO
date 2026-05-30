import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { UsersService } from '../users/users.service';
import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private vendorsService: VendorsService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    if ((dto.userType as string) === 'admin') {
      throw new ForbiddenException('Não é permitido registar como admin.');
    }

    if (dto.userType === 'vendor') {
      const user = await this.usersService.create(dto, { role: 'vendor', active: false }); // 👈 só aqui

      const vendorProfile = await this.vendorsService.createProfile({
        userId: user.id,
        businessName: dto.businessName,
        businessDescription: dto.businessDescription,
      });

      const token = this.generateToken({ ...user, role: 'vendor' });
      return {
        user: { ...user, role: 'vendor', active: false },
        vendorProfile,
        token,
      };
    }

    // Utilizador normal
    const user = await this.usersService.create(dto); // 👈 só aqui
    const token = this.generateToken(user);
    return { user, token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    if (!user) return null;

  
    const { password, ...userWithoutPassword } = user;

    let isApproved = true;
    if (user.role === 'vendor') {
      const profile = await this.vendorsService.findByUserId(user.id);
      isApproved = profile.status === 'approved';
    }

    const finalizedUser = { ...userWithoutPassword, approved: isApproved };

    const token = this.generateToken(finalizedUser);
    return { user: finalizedUser, token };
  }

  private generateToken(user: any): string {
    return this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '24h' },
    );
  }

  async validateUserFromToken(userId: number) {
    return this.usersService.findOne(userId);
  }
}