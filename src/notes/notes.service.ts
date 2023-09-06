import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesRepository } from './notes.repository';

@Injectable()
export class NotesService {
  constructor(private readonly repository: NotesRepository) {}
  async create(createNoteDto: CreateNoteDto, userId: number) {
    const title = await this.repository.findByTitle(
      createNoteDto.title,
      userId,
    );
    if (title) {
      throw new ConflictException('Title of Note already exist');
    }
    return await this.repository.create(createNoteDto, userId);
  }

  async findAll(userId: number) {
    return await this.repository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    const note = await this.repository.findOne(id);
    if (!note) {
      throw new NotFoundException('Note not exist or not found');
    }
    if (note.userId !== userId) {
      throw new ForbiddenException('this Note does not belong to you');
    }
    return note;
  }

  async update(id: number, updateNoteDto: UpdateNoteDto, userId: number) {
    const note = await this.repository.findOne(id);
    if (!note) {
      throw new NotFoundException('Note not exist or not found');
    }
    if (note.userId !== userId) {
      throw new ForbiddenException('this Note does not belong to you');
    }
    return await this.repository.update(id, updateNoteDto);
  }

  async remove(id: number, userId: number) {
    const note = await this.repository.findOne(id);
    if (!note) {
      throw new NotFoundException('Note not exist or not found');
    }
    if (note.userId !== userId) {
      throw new ForbiddenException('this Note does not belong to you');
    }
    return await this.repository.remove(id);
  }

  async deleteByUserId(userId: number) {
    return await this.repository.deleteByUserId(userId);
  }
}
