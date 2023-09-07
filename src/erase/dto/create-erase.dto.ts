import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEraseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'M1Nh4s3nh4_aqui',
    description: 'Password from user',
  })
  password: string;
}
