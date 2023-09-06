import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  number: number;

  @IsNotEmpty()
  @IsString()
  cvc: string;

  @IsNotEmpty()
  @IsDateString()
  expiration: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  isCredit: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isDebit: boolean;
}
