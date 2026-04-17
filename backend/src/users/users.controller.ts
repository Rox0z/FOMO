import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  // PUBLIC REGISTER
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // USER SELF PROFILE
  @Get('me')
  @UseGuards(JwtGuard)
  me(@CurrentUser() user: any) {
    return user;
  }

  // ADMIN - LIST USERS
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // ADMIN - GET USER BY ID
  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // USER UPDATE OWN PROFILE
  @Patch('me')
  @UseGuards(JwtGuard)
  updateMe(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  // ADMIN DELETE USER
  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}