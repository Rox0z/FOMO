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

import { CreateVendorDto } from './dto/create-vendor.dto';
import { VendorsService } from './vendors.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vendors')
@ApiBearerAuth('access-token')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // -------------------------
  // PUBLIC - REGISTER VENDOR
  // -------------------------
  @Post('register')
  register(@Body() dto: CreateVendorDto) {
    return this.vendorsService.register(dto);
  }

  // -------------------------
  // ADMIN - LIST ALL VENDORS
  // -------------------------
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  findAll() {
    return this.vendorsService.findAll();
  }

  // -------------------------
  // ADMIN - GET VENDOR BY ID
  // -------------------------
  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(+id);
  }

  // -------------------------
  // VENDOR - GET OWN PROFILE
  // -------------------------
  @Get('me')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.VENDOR)
  me(@CurrentUser() user: any) {
    return this.vendorsService.findByUserId(user.id);
  }

  // -------------------------
  // VENDOR - UPDATE OWN PROFILE
  // -------------------------
  @Patch('me')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.VENDOR)
  updateMe(
    @CurrentUser() user: any,
    @Body() dto: CreateVendorDto,
  ) {
    return this.vendorsService.updateByUserId(user.id, dto);
  }

  // -------------------------
  // ADMIN - REMOVE VENDOR
  // -------------------------
  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(+id);
  }
}