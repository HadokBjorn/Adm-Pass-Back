import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('Cards')
@ApiBearerAuth()
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ description: 'Create a card' })
  @ApiCreatedResponse({ description: 'Create a card' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'The card title is already in use by the user',
  })
  create(@Body() createCardDto: CreateCardDto, @User() user: UserPrisma) {
    return this.cardsService.create(createCardDto, user.id);
  }

  @Get()
  @ApiOperation({ description: 'Get all cards' })
  @ApiResponse({ status: HttpStatus.OK, description: 'return all user cards' })
  findAll(@User() user: UserPrisma) {
    return this.cardsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get one card' })
  @ApiParam({ name: 'id', example: 1, description: 'card id' })
  findOne(@Param('id') id: string, @User() user: UserPrisma) {
    return this.cardsService.findOne(+id, user.id);
  }

  @Put(':id')
  @ApiOperation({ description: 'Update a card by id' })
  @ApiParam({ name: 'id', example: 1, description: 'card id' })
  @ApiBody({ type: CreateCardDto })
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @User() user: UserPrisma,
  ) {
    return this.cardsService.update(+id, updateCardDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ description: 'delete a card by id' })
  @ApiParam({ name: 'id', example: 1, description: 'card id' })
  remove(@Param('id') id: string, @User() user: UserPrisma) {
    return this.cardsService.remove(+id, user.id);
  }
}
