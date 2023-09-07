import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInAuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'naruto@gmail.com', description: 'email from user' })
  email: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'MyPassword', description: 'password from user' })
  password: string;
}
