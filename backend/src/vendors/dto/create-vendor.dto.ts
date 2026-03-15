import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class CreateVendorDto extends CreateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

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
