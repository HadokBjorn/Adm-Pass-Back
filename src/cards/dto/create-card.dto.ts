import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'title for card', example: 'my shopping card' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'name for card', example: 'Naruto Uzumaki' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'number for card', example: '546782789' })
  number: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'cvc for card', example: '546' })
  cvc: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ description: 'expiration for card', example: '2025-09-05' })
  expiration: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'password for card', example: 'M1Nh4s3nh4_aqui' })
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'set credit card',
    example: 'false',
  })
  isCredit: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'set debit card',
    example: 'true',
  })
  isDebit: boolean;
}
