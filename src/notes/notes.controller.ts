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
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserPrisma } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('Notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ description: 'Create a note' })
  @ApiCreatedResponse()
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'The note title already exist by user',
  })
  create(@Body() createNoteDto: CreateNoteDto, @User() user: UserPrisma) {
    return this.notesService.create(createNoteDto, user.id);
  }

  @Get()
  @ApiOperation({ description: 'Create all notes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all user notes',
  })
  findAll(@User() user: UserPrisma) {
    return this.notesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get one note by id' })
  findOne(@Param('id') id: string, @User() user: UserPrisma) {
    return this.notesService.findOne(+id, user.id);
  }

  @Put(':id')
  @ApiOperation({ description: 'Update a note by id' })
  @ApiBody({ type: CreateNoteDto })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @User() user: UserPrisma,
  ) {
    return this.notesService.update(+id, updateNoteDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ description: 'Delete a note by id' })
  remove(@Param('id') id: string, @User() user: UserPrisma) {
    return this.notesService.remove(+id, user.id);
  }
}
