import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @User() user: UserPrisma) {
    return this.cardsService.create(createCardDto, user.id);
  }

  @Get()
  findAll(@User() user: UserPrisma) {
    return this.cardsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: UserPrisma) {
    return this.cardsService.findOne(+id, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @User() user: UserPrisma,
  ) {
    return this.cardsService.update(+id, updateCardDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: UserPrisma) {
    return this.cardsService.remove(+id, user.id);
  }
}
