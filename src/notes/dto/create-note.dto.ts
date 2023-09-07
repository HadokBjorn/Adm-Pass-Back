import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'My favorites phrases',
    description: 'title for note',
  })
  title: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'That is my ninja way',
    description: 'text for note',
  })
  text: string;
}
