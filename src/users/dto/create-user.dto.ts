import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Naruto', description: 'username for user' })
  name: string;
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'naruto@gmail.com', description: 'email for user' })
  email: string;
  @IsStrongPassword()
  @IsNotEmpty()
  @ApiProperty({ example: 'M1Nh4s3nh4_aqui', description: 'password for user' })
  password: string;
}
