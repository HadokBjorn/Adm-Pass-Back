import { Controller, Body, Delete, UseGuards } from '@nestjs/common';
import { EraseService } from './erase.service';
import { CreateEraseDto } from './dto/create-erase.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserPrisma } from '@prisma/client';
import { User } from '../decorators/user.decorator';

@UseGuards(AuthGuard)
@Controller('erase')
export class EraseController {
  constructor(private readonly eraseService: EraseService) {}

  @Delete()
  remove(@Body() createEraseDto: CreateEraseDto, @User() user: UserPrisma) {
    return this.eraseService.remove(createEraseDto, user);
  }
}
