import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto extends CreateUserDto {

  @ApiProperty({ example: "Tech Solutions Inc." })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

  @ApiProperty({ example: "A leading technology company specializing in innovative solutions." })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessDescription?: string;

  // This will force userType to 'vendor' in the service
  constructor() {
    super();
    this.userType = 'vendor';
  }
}
