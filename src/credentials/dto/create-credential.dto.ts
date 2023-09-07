import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateCredentialDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My favorite site',
    description: 'title for a credential',
  })
  title: string;
  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    example: 'https://github.com/HadokBjorn',
    description: 'url for a credential',
  })
  url: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Naruto_Uzumaki',
    description: 'username for a credential',
  })
  username: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'M1Nh4s3nh4_aqui',
    description: 'password for a credential',
  })
  password: string;
}
