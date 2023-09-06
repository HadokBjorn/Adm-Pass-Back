import { Injectable } from '@nestjs/common';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(createCardDto: Omit<Card, 'id'>) {
    return this.prisma.card.create({
      data: createCardDto,
    });
  }

  findAll(userId: number) {
    return this.prisma.card.findMany({
      where: { userId },
    });
  }

  findOne(id: number) {
    return this.prisma.card.findUnique({
      where: { id },
    });
  }

  findByTitle(title: string, userId: number) {
    return this.prisma.card.findUnique({
      where: {
        title_userId: { title, userId },
      },
    });
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return this.prisma.card.update({
      where: { id },
      data: updateCardDto,
    });
  }

  remove(id: number) {
    return this.prisma.card.delete({
      where: { id },
    });
  }
}
