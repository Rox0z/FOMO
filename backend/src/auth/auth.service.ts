import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const token = this.generateToken(user.id);
    return {
      user,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      return null;
    }

    const token = this.generateToken(user.id);
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  private generateToken(userId: number): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: '24h',
      },
    );
  }

  async validateUserFromToken(userId: number) {
    return this.usersService.findOne(userId);
  }
}
