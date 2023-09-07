import {
  Controller,
  Body,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { EraseService } from './erase.service';
import { CreateEraseDto } from './dto/create-erase.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('Erase')
@ApiBearerAuth()
@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Delete()
  @ApiOperation({ description: 'Delete all user data by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Deleted all user data' })
  remove(@Body() createEraseDto: CreateEraseDto, @User() user: UserPrisma) {
    return this.eraseService.remove(createEraseDto, user);
  }
}
