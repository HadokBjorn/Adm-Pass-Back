import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createNoteDto: CreateNoteDto, userId: number) {
    return this.prisma.note.create({
      data: {
        userId,
        ...createNoteDto,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.note.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.note.findUnique({
      where: { id },
    });
  }

  findByTitle(title: string, userId: number) {
    return this.prisma.note.findUnique({
      where: {
        title_userId: { title, userId },
      },
    });
  }

  update(id: number, updateNoteDto: UpdateNoteDto) {
    return this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });
  }

  remove(id: number) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
