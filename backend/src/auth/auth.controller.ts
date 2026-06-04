import {
    Body,
    Controller,
    Get,
    Post,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from './jwt/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    if (!result) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if ('error' in result) {
      if (result.error === 'account_blocked') {
        throw new UnauthorizedException('account_blocked');
      }
      if (result.error === 'vendor_not_approved') {
        throw new UnauthorizedException('vendor_not_approved');
      }
      throw new UnauthorizedException('Invalid email or password');
    }
    return result;
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}