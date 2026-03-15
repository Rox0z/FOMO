import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  register(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.register(createVendorDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  findAll() {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  update(@Param('id') id: string, @Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.update(+id, createVendorDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(+id);
  }
}
