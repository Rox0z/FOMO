import {
    IsEmail,
    IsIn,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({ example: "example@mail.com" })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;

   @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;
  
  @ApiProperty({ example: "+1234567890" })  
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @ApiProperty({ example: "US" })
  @IsOptional()
  @IsString()
  @MaxLength(5, { message: 'Country code must not exceed 5 characters' })
  countryCode?: string;

  @ApiProperty({ example: "user" })
  @IsOptional()
  @IsIn(['user', 'vendor'], { message: 'User type must be either "user" or "vendor"' })
  userType?: 'user' | 'vendor';
}
