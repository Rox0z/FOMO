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
    const token = this.generateToken(user);
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

    const token = this.generateToken(user);
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  private generateToken(user: any): string {
    return this.jwtService.sign(
      { sub: user.id , role: user.role }, // You can include more user info in the token if needed
      {
        expiresIn: '24h',
      },
    );
  }

  async validateUserFromToken(userId: number) {
    return this.usersService.findOne(userId);
  }
}
